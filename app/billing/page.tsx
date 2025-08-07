"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CreditCard, ExternalLink, Loader2, AlertCircle, Sparkles, Check, ArrowRight, Crown, Zap, X, ChevronDown, ChevronUp } from "lucide-react"
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
    price: "$30",
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
    price: "$40",
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
    price: "$75",
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
    price: "$10",
    description: "Quick boost for small projects",
    features: ["5 additional tokens", "Instant delivery", "Same quality"],
    popular: false,
    color: "border-green-400",
    badge: "Quick Boost"
  },
  {
    id: "standard",
    name: "Standard Pack",
    price: "$20",
    description: "Perfect for most projects",
    features: ["15 additional tokens", "Instant delivery", "Priority processing"],
    popular: true,
    color: "border-blue-500",
    badge: "Most Popular"
  },
  {
    id: "plus",
    name: "Plus Pack",
    price: "$30",
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
  const [hasOnboardingState, setHasOnboardingState] = useState(false)
  const [showUnsubscribeDialog, setShowUnsubscribeDialog] = useState(false)
  const [showChangePlanOptions, setShowChangePlanOptions] = useState(false)
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
        throw new Error(data.error)
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("Failed to create portal session")
      }
    } catch (error) {
      console.error("Error creating portal session:", error)
      setError(error instanceof Error ? error.message : "Failed to open billing portal. Please try again.")
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
          success_url: `${window.location.origin}/billing?success=true`,
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
              userDataResult = await createUserData(firebaseUser)
            } catch (createError) {
              console.error("Error creating user data:", createError)
              setError("Failed to create user data")
              setIsLoadingData(false)
              return
            }
          }
          
          setUserData(userDataResult)
          
          // If user has a Stripe customer ID, sync subscription status and fetch Stripe data
          if (userDataResult?.stripeCustomerId) {
            // Sync subscription status from Stripe
            const syncedData = await syncSubscriptionFromStripe(firebaseUser.uid)
            if (syncedData) {
              setUserData(syncedData)
            }
            
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
              }
            }
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
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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

  // If user is not logged in, show pricing section
  if (!user) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-white font-sora">Choose Your Plan</h1>
          <p className="text-gray-400 mt-1">Simple, transparent pricing that scales with your needs.</p>
        </div>

        {/* Onboarding State Message */}
        {hasOnboardingState && (
          <Card className="bg-blue-900/20 border-blue-500/30 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                Complete Your Generation
              </CardTitle>
              <CardDescription>
                You have a pending image generation. Create an account and choose a plan to continue.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

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

      {/* Onboarding State Message */}
      {hasOnboardingState && (
        <Card className="bg-blue-900/20 border-blue-500/30 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              Complete Your Generation
            </CardTitle>
            <CardDescription>
              You have a pending image generation. Choose a plan to continue and generate your image.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Current Subscription Status */}
      {subscription ? (
        <Card className="bg-[#1c1c1c] border-gray-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-400" />
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
            </div>
          </CardHeader>
          <CardContent>
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
              <p className="text-sm text-gray-400">Next billing date: {formatDate(subscription.current_period_end)}</p>
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
                              {plan.id === subscription.plan.nickname?.toLowerCase() ? 'Current Plan' : 'Switch to ' + plan.name}
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Unsubscribe Button */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-red-400">Cancel Subscription</h4>
                  <p className="text-sm text-gray-400">You'll lose access to your current plan benefits at the end of your billing period.</p>
                </div>
                <Dialog open={showUnsubscribeDialog} onOpenChange={setShowUnsubscribeDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                      <X className="mr-2 h-4 w-4" />
                      Unsubscribe
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#1c1c1c] border-gray-700 text-white">
                    <DialogHeader>
                      <DialogTitle className="text-red-400">Cancel Subscription</DialogTitle>
                      <DialogDescription className="text-gray-300">
                        Are you sure you want to cancel your subscription? You'll lose access to your current plan benefits at the end of your billing period.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowUnsubscribeDialog(false)} className="border-gray-600 text-gray-300">
                        Keep Subscription
                      </Button>
                      <Button variant="destructive" onClick={handleUnsubscribe} className="bg-red-600 hover:bg-red-700">
                        Yes, Cancel Subscription
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
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
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-gray-300">Free Plan Limitations</p>
                    <p className="text-sm text-gray-400">You're currently on the free plan with limited generations. Choose a plan to get started.</p>
                  </div>
                </div>
              </div>
              
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

      {/* Payment Method */}
      {stripeCustomer ? (
        <Card className="bg-[#1c1c1c] border-gray-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Update your payment details</CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={isLoading}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Update Payment
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <CreditCard className="h-8 w-8 text-gray-400" />
              <div>
                <p className="font-semibold">Payment method on file</p>
                <p className="text-sm text-gray-400">Manage your payment method in the billing portal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-[#1c1c1c] border-gray-800 text-white">
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>No payment method on file</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <CreditCard className="h-8 w-8 text-gray-400" />
              <div>
                <p className="font-semibold">No payment method</p>
                <p className="text-sm text-gray-400">Add a payment method when you subscribe</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      <Card className="bg-[#1c1c1c] border-gray-800 text-white">
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-800/50">
                  <TableHead className="text-white">Invoice</TableHead>
                  <TableHead className="text-white">Date</TableHead>
                  <TableHead className="text-white">Amount</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-right text-white">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id} className="border-gray-700 hover:bg-gray-800/50">
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{formatDate(invoice.created)}</TableCell>
                    <TableCell>{formatAmount(invoice.amount_paid)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(invoice.status)}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.hosted_invoice_url ? (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="View Invoice"
                          onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No billing history available</p>
              <p className="text-sm text-gray-500 mt-1">Invoices will appear here once you have an active subscription</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
