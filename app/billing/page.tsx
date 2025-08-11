"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CreditCard, ExternalLink, Loader2, AlertCircle, AlertTriangle, Sparkles, Check, ArrowRight, Crown, Zap, X, ChevronDown, ChevronUp, Calendar } from "lucide-react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"
import { getUserData, UserData, syncSubscriptionFromStripe, createUserData } from "@/lib/users"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

// Define the StripeCustomer interface locally since we're not importing from stripe-customer
interface StripeCustomer {
  id: string
  email: string
  name?: string
  subscription?: {
    id: string
    status: string
    current_period_end: number
    plan: {
      nickname: string
      amount: number
      currency: string
      interval: string
    }
  }
}

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: "$29",
    period: "",
    description: "Perfect for getting started with image generation.",
    features: ["10 image generations", "Basic styling options", "Email support"],
    popular: false,
    color: "border-blue-400",
    badge: "Starter"
  },
  {
    id: "pro",
    name: "Pro",
    price: "$39",
    period: "",
    description: "Great value for growing businesses and creators.",
    features: ["20 image generations", "Advanced styling options", "Priority processing", "Priority support"],
    popular: true,
    color: "border-blue-500",
    badge: "Better Value"
  },
  {
    id: "elite",
    name: "Elite",
    price: "$74",
    period: "",
    description: "Best value for high-volume image generation needs.",
    features: ["50 image generations", "All Pro features", "Custom integrations", "Dedicated support"],
    popular: false,
    color: "border-blue-600",
    badge: "Best Value"
  }
]

const addOnPacks = [
  {
    id: "mini",
    name: "Mini Pack",
    price: "$9",
    description: "Quick boost for small projects",
    features: ["5 additional tokens", "Instant delivery", "Same quality"],
    popular: false,
    color: "border-green-400",
    badge: "Quick Boost"
  },
  {
    id: "standard",
    name: "Standard Pack",
    price: "$19",
    description: "Perfect for most projects",
    features: ["15 additional tokens", "Instant delivery", "Priority processing"],
    popular: true,
    color: "border-blue-500",
    badge: "Most Popular"
  },
  {
    id: "plus",
    name: "Plus Pack",
    price: "$29",
    description: "Best value for larger projects",
    features: ["25 additional tokens", "Instant delivery", "Priority processing", "Dedicated support"],
    popular: false,
    color: "border-purple-500",
    badge: "Best Value"
  }
]

export default function BillingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [stripeCustomer, setStripeCustomer] = useState<StripeCustomer | null>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isLoadingCustomerData, setIsLoadingCustomerData] = useState(false)
  const [hasOnboardingState, setHasOnboardingState] = useState(false)
  const [showUnsubscribeDialog, setShowUnsubscribeDialog] = useState(false)
  const [showChangePlanOptions, setShowChangePlanOptions] = useState(false)
  const [portalConfigIssue, setPortalConfigIssue] = useState(false)
  const router = useRouter()
  
  // Extract subscription from stripeCustomer
  const subscription = stripeCustomer?.subscription

  const handleManageSubscription = async () => {
    setIsLoading(true)
    setError("")
    try {
      if (!stripeCustomer?.id) {
        setError("No billing account found. Please contact support to set up your billing.")
        return
      }

      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: stripeCustomer.id,
          return_url: `${window.location.origin}/billing`,
        }),
      })

      const data = await response.json()
      
      if (data.error) {
        // Handle specific portal configuration error
        if (data.details && data.details.includes('customer portal needs to be configured')) {
          setPortalConfigIssue(true)
          throw new Error("Billing management is currently being set up. Please contact support for immediate assistance with your subscription.")
        }
        // Handle other specific errors
        if (data.error.includes('customer portal not configured')) {
          setPortalConfigIssue(true)
          throw new Error("Billing management is currently being set up. Please contact support for immediate assistance with your subscription.")
        }
        // Handle generic portal session errors
        if (data.error.includes('Failed to create portal session')) {
          setPortalConfigIssue(true)
          throw new Error("Billing management is currently being set up. Please contact support for immediate assistance with your subscription.")
        }
        throw new Error(data.error)
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("Failed to create portal session")
      }
    } catch (error) {
      console.error("Error creating portal session:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to open billing portal. Please try again."
      setError(errorMessage)
      
      // Show additional help for portal configuration issues
      if (errorMessage.includes('customer portal needs to be configured') || 
          errorMessage.includes('billing management is currently being set up')) {
        console.log("Portal configuration issue detected. User needs to contact support.")
      }
      
      // Provide additional guidance for portal issues
      if (errorMessage.includes('billing management is currently being set up')) {
        console.log("User should contact support for billing assistance.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = async (plan: 'basic' | 'pro' | 'elite' | 'mini' | 'standard' | 'plus') => {
    setIsLoading(true)
    setError("")
    try {
      if (!user?.email) {
        setError("Please log in to subscribe")
        return
      }

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          plan: plan,
          success_url: `${window.location.origin}/billing/success?plan=${plan}`,
          cancel_url: `${window.location.origin}/billing?canceled=true`,
        }),
      })

      const data = await response.json()
      
      if (data.error) {
        if (data.details) {
          const errorMessage = `${data.error}\n\n${data.details.instructions || ''}\n\nRequired environment variables: ${data.details.requiredEnvVars?.join(', ') || 'None specified'}`
          throw new Error(errorMessage)
        } else {
          throw new Error(data.error)
        }
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("Failed to create checkout session")
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      setError(error instanceof Error ? error.message : "Failed to create checkout session. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgrade = () => {
    router.push("/subscribe")
  }

  const handleUnsubscribe = async () => {
    setShowUnsubscribeDialog(false)
    await handleManageSubscription()
  }

  // Fetch user data and Stripe customer information
  useEffect(() => {
    // Check for onboarding state
    const onboardingState = localStorage.getItem("onboardingState")
    if (onboardingState) {
      setHasOnboardingState(true)
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          let userDataResult = await getUserData(firebaseUser.uid)
          
          // If user data doesn't exist, create it
          if (!userDataResult) {
            try {
              console.log("Creating user data in billing page for:", firebaseUser.uid)
              userDataResult = await createUserData(firebaseUser)
              console.log("User data created successfully in billing page")
            } catch (createError) {
              console.error("Error creating user data in billing page:", createError)
              setError("Failed to create user data")
              setIsLoadingData(false)
              return
            }
          }
          
          setUserData(userDataResult)
          
          // Always try to sync subscription status from Stripe (it will search by email if needed)
          try {
            console.log("Attempting to sync subscription status for user:", firebaseUser.uid)
            const syncedData = await syncSubscriptionFromStripe(firebaseUser.uid)
            if (syncedData) {
              console.log("Successfully synced subscription data:", syncedData)
              setUserData(syncedData)
            } else {
              console.log("No subscription data found or sync failed")
            }
          } catch (syncError) {
            console.error("Error syncing subscription:", syncError)
          }
          
          // If user has a Stripe customer ID, fetch additional Stripe data
          if (userDataResult?.stripeCustomerId) {
            setIsLoadingCustomerData(true)
            // Fetch customer data
            const customerResponse = await fetch(`/api/stripe/customer?customerId=${userDataResult.stripeCustomerId}`)
            const customerData = await customerResponse.json()
            
            if (customerData.customer) {
              setStripeCustomer(customerData.customer)
              
              // Fetch invoices
              const invoicesResponse = await fetch(`/api/stripe/customer?customerId=${userDataResult.stripeCustomerId}&action=invoices`)
              const invoicesData = await invoicesResponse.json()
              
              if (invoicesData.invoices) {
                setInvoices(invoicesData.invoices)
                console.log('Invoices loaded:', invoicesData.invoices)
                if (invoicesData.invoices.length > 0) {
                  console.log('First invoice structure:', invoicesData.invoices[0])
                }
              }
            }
            setIsLoadingCustomerData(false)
          }
        } catch (error) {
          console.error("Error fetching customer data:", error)
          setError("Failed to load billing information")
        } finally {
          setIsLoadingData(false)
        }
      } else {
        setIsLoadingData(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const formatAmount = (amount: number, currency = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  const formatDate = (timestamp: number) => {
    // Check if timestamp is valid (not 0, null, or undefined)
    if (!timestamp || timestamp <= 0) {
      return "Not available"
    }
    
    try {
      return new Date(timestamp * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error, "timestamp:", timestamp)
      return "Invalid date"
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: "bg-green-500/20 text-green-400 border-green-500/30",
      past_due: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      canceled: "bg-red-500/20 text-red-400 border-red-500/30",
      paid: "bg-green-500/20 text-green-400 border-green-500/30",
    }

    return statusColors[status as keyof typeof statusColors] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }

  // Helper function to get plan name from price ID
  const getPlanNameFromPriceId = (priceId: string) => {
    if (!priceId) return 'Subscription'
    
    const planMap: { [key: string]: string } = {
      // Subscription plans
      [process.env.STRIPE_BASIC_PRICE_ID || '']: 'Basic Plan',
      [process.env.STRIPE_PRO_PRICE_ID || '']: 'Pro Plan',
      [process.env.STRIPE_ELITE_PRICE_ID || '']: 'Elite Plan',
      // Token packs
      [process.env.STRIPE_MINI_PRICE_ID || '']: 'Mini Token Pack',
      [process.env.STRIPE_STANDARD_PRICE_ID || '']: 'Standard Token Pack',
      [process.env.STRIPE_PLUS_PRICE_ID || '']: 'Plus Token Pack',
    }
    
    return planMap[priceId] || 'Unknown Plan'
  }

  // If user is not logged in, show pricing section
  if (!user) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-white font-sora">Choose Your Plan</h1>
          <p className="text-gray-400 mt-1">Simple, transparent pricing that scales with your needs.</p>
        </div>

        {/* Pricing Plans - Matching the pricing section design */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="relative h-full">
              <Card
                className={cn(
                  "card-zarta flex flex-col h-full min-h-[400px] transition-all duration-200 hover:scale-105",
                  plan.popular 
                    ? `${plan.color} border-2` 
                    : "border-gray-700 hover:border-gray-600"
                )}
              >
                <CardHeader className="flex-shrink-0 pb-3">
                  <CardTitle className="heading-3 flex items-center gap-2">
                    {plan.name}
                  </CardTitle>
                  <div className="flex items-baseline">
                    <span className="text-2xl sm:text-3xl font-bold">{plan.price}</span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                  <p className="pt-1 text-gray-400 text-xs sm:text-sm">{plan.description}</p>
                  <div className="flex items-center gap-1 pt-1">
                    <span className="text-xs text-gray-300">{plan.badge}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="flex flex-col flex-1 pt-0">
                  <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => router.push("/signup")}
                    className="w-full py-2 text-white text-xs sm:text-sm bg-blue-600 hover:bg-blue-700"
                  >
                    Create Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30 text-white">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Ready to get started?</h3>
            <p className="text-gray-300 mb-4">Join thousands of creators who trust Zarta for their image generation needs.</p>
            <Button 
              onClick={() => router.push("/signup")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If user is logged in but loading data
  if (isLoadingData) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-white font-sora">Billing</h1>
          <p className="text-gray-400 mt-1">Manage your subscription and view billing history.</p>
        </div>
        <Card className="bg-[#1c1c1c] border-gray-800 text-white">
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-400">Loading billing information...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white font-sora">Billing</h1>
        <p className="text-gray-400 mt-1">Manage your subscription and view billing history.</p>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-900/20 border-red-500/30 text-white">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium mb-1">Billing Error</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Subscription Status */}
      {subscription ? (
        <Card className="bg-[#1c1c1c] border-gray-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Current Subscription
              </CardTitle>
              <CardDescription>
                {subscription.plan.nickname} - {subscription.plan.interval}ly billing
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowChangePlanOptions(!showChangePlanOptions)}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
              >
                {showChangePlanOptions ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                Change Plan
              </Button>
              <Button onClick={handleManageSubscription} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                Manage
              </Button>
              {portalConfigIssue && (
                <div className="text-xs text-yellow-500 mt-2">
                  Note: Billing management portal is being configured. Contact support for immediate assistance.
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingCustomerData ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                <span className="text-gray-400">Loading subscription details...</span>
              </div>
            ) : (
              <>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-4xl font-bold">
                      {formatAmount(subscription.plan.amount, subscription.plan.currency)}
                      <span className="text-lg font-normal text-gray-400">/{subscription.plan.interval}</span>
                    </p>
                    <Badge className={getStatusBadge(subscription.status)}>
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">
                    {subscription.current_period_end && subscription.current_period_end > 0 
                      ? `Next billing date: ${formatDate(subscription.current_period_end)}`
                      : "Billing cycle information not available. Please contact support if you need billing details."
                    }
                  </p>
                </div>

                {/* Change Plan Options */}
                {showChangePlanOptions && (
                  <div className="mt-6 space-y-4">
                    <div className="border-t border-gray-700 pt-4">
                      <h4 className="text-lg font-semibold mb-4">Upgrade or Downgrade Your Plan</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        {plans.map((plan) => (
                          <div key={plan.id} className="relative">
                            <Card className="bg-gray-800/30 border-gray-600 hover:border-gray-500 transition-colors">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-lg">{plan.name}</CardTitle>
                                <div className="flex items-baseline">
                                  <span className="text-xl font-bold">{plan.price}</span>
                                </div>
                                <p className="text-sm text-gray-400">{plan.description}</p>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <Button
                                  onClick={() => handleSubscribe(plan.id as 'basic' | 'pro' | 'elite')}
                                  disabled={isLoading}
                                  className="w-full bg-blue-600 hover:bg-blue-700"
                                  size="sm"
                                >
                                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                  {plan.id === subscription.plan.nickname?.toLowerCase() || plan.id === subscription.plan.nickname ? 'Current Plan' : 'Switch to ' + plan.name}
                                </Button>
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        /* No subscription - show upgrade options */
        <Card className="bg-[#1c1c1c] border-gray-800 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Choose Your Plan
            </CardTitle>
            <CardDescription>Select the perfect plan for your image generation needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Subscription Plans */}
              <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div key={plan.id} className="relative h-full">
                    <Card
                      className={cn(
                        "card-zarta flex flex-col h-full min-h-[400px] transition-all duration-200 hover:scale-105",
                        plan.popular 
                          ? `${plan.color} border-2` 
                          : "border-gray-700 hover:border-gray-600"
                      )}
                    >
                      <CardHeader className="flex-shrink-0 pb-3">
                        <CardTitle className="heading-3 flex items-center gap-2">
                          {plan.name}
                        </CardTitle>
                        <div className="flex items-baseline">
                          <span className="text-2xl sm:text-3xl font-bold">{plan.price}</span>
                          <span className="text-gray-400">{plan.period}</span>
                        </div>
                        <p className="pt-1 text-gray-400 text-xs sm:text-sm">{plan.description}</p>
                        <div className="flex items-center gap-1 pt-1">
                          <span className="text-xs text-gray-300">{plan.badge}</span>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="flex flex-col flex-1 pt-0">
                        <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-1">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Check className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-gray-300">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <Button
                          onClick={() => handleSubscribe(plan.id as 'basic' | 'pro' | 'elite')}
                          disabled={isLoading}
                          className="w-full py-2 text-white text-xs sm:text-sm bg-blue-600 hover:bg-blue-700"
                        >
                          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Subscribe
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add-on Token Packs for Subscribed Users */}
      {subscription && (
        <Card className="bg-[#1c1c1c] border-gray-800 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-400" />
              Additional Token Packs
            </CardTitle>
            <CardDescription>Purchase extra tokens when you need more image generations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {addOnPacks.map((pack) => (
                <div key={pack.id} className="relative h-full">
                  <Card
                    className={cn(
                      "card-zarta flex flex-col h-full min-h-[300px] transition-all duration-200 hover:scale-105",
                      pack.popular 
                        ? `${pack.color} border-2` 
                        : "border-gray-700 hover:border-gray-600"
                    )}
                  >
                    <CardHeader className="flex-shrink-0 pb-3">
                      <CardTitle className="heading-3">{pack.name}</CardTitle>
                      <div className="flex items-baseline">
                        <span className="text-2xl sm:text-3xl font-bold">{pack.price}</span>
                      </div>
                      <p className="pt-1 text-gray-400 text-xs sm:text-sm">{pack.description}</p>
                      <div className="flex items-center gap-1 pt-1">
                        <span className="text-xs text-gray-300">{pack.badge}</span>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex flex-col flex-1 pt-0">
                      <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-1">
                        {pack.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button
                        onClick={() => handleSubscribe(pack.id as 'mini' | 'standard' | 'plus')}
                        disabled={isLoading}
                        className="w-full py-2 text-white text-xs sm:text-sm bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Purchase
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Billing History */}
      <Card className="bg-gradient-to-br from-[#1c1c1c] to-[#1a1a1a] border-gray-700/50 text-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <CreditCard className="h-6 w-6 text-blue-400" />
            Billing History
          </CardTitle>
          <CardDescription className="text-gray-300">
            View your subscription and purchase history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.map((invoice, index) => (
                <div 
                  key={invoice.id} 
                  className="bg-gray-800/30 rounded-lg border border-gray-700/50 p-4 hover:border-gray-600/50 transition-all duration-200 hover:bg-gray-800/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <h4 className="font-semibold text-white">
                          {invoice.price?.id ? getPlanNameFromPriceId(invoice.price.id) : 
                            invoice.lines?.data?.[0]?.description || 'Subscription'}
                        </h4>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-400">
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {invoice.created ? formatDate(invoice.created) : 'N/A'}
                        </span>
                        <span className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          {formatAmount(invoice.amount_paid)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusBadge(invoice.status)} px-3 py-1`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                      {invoice.hosted_invoice_url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                          onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No billing history yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Your subscription and purchase history will appear here once you have an active subscription or make purchases.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
