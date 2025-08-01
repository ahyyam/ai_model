"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CreditCard, ExternalLink, Loader2, AlertCircle, Star, Sparkles } from "lucide-react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"
import { getUserData, UserData } from "@/lib/users"

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



export default function BillingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [stripeCustomer, setStripeCustomer] = useState<StripeCustomer | null>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [hasOnboardingState, setHasOnboardingState] = useState(false)
  
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

  const handleUpdatePaymentMethod = async () => {
    setIsLoading(true)
    setError("")
    try {
      // For now, show a message that this feature requires a Stripe customer
      // In a real implementation, you would get the customer ID from your database
      setError("Payment method updates require a Stripe customer account. Please contact support to set up your billing.")
    } catch (error) {
      console.error("Error creating portal session:", error)
      setError("Failed to open billing portal. Please try again.")
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
        // Handle detailed error messages from the API
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
          const userDataResult = await getUserData(firebaseUser.uid)
          setUserData(userDataResult)
          
          // If user has a Stripe customer ID, fetch Stripe data via API
          if (userDataResult?.stripeCustomerId) {
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

      {/* Subscription Plans for Non-Subscribed Users */}
      {!subscription && (
        <Card className="bg-[#1c1c1c] border-gray-800 text-white">
          <CardHeader>
            <CardTitle>Choose Your Plan</CardTitle>
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
              <div className="space-y-4">
                {/* Mobile Cards Layout */}
                <div className="md:hidden space-y-4">
                  {/* Basic Plan Card */}
                  <Card className="bg-gray-800/30 border-gray-700 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">Basic</h3>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Starter</Badge>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Price:</span>
                          <span className="font-semibold">$30</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Images:</span>
                          <span className="font-semibold">10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Cost per Image:</span>
                          <span className="font-semibold">$3.00</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleSubscribe('basic')} 
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Subscribe
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Pro Plan Card */}
                  <Card className="bg-gray-800/30 border-purple-500/50 text-white relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-purple-500 text-white px-3 py-1 text-xs font-semibold">
                        Most Popular
                      </Badge>
                    </div>
                    <CardContent className="p-4 pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">Pro</h3>
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Better Value</Badge>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Price:</span>
                          <span className="font-semibold">$40</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Images:</span>
                          <span className="font-semibold">20</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Cost per Image:</span>
                          <span className="font-semibold">$2.00</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleSubscribe('pro')} 
                        disabled={isLoading}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Subscribe
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Elite Plan Card */}
                  <Card className="bg-gray-800/30 border-pink-500/50 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">Elite</h3>
                          <Star className="h-4 w-4 text-yellow-400" />
                        </div>
                        <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">Best Value ⭐</Badge>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Price:</span>
                          <span className="font-semibold">$75</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Images:</span>
                          <span className="font-semibold">50</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Cost per Image:</span>
                          <span className="font-semibold">$1.50</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleSubscribe('elite')} 
                        disabled={isLoading}
                        className="w-full bg-pink-600 hover:bg-pink-700"
                      >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Subscribe
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden md:block overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="border-gray-700 hover:bg-gray-800/50">
                        <TableHead className="text-white font-semibold">Package</TableHead>
                        <TableHead className="text-white font-semibold">Price</TableHead>
                        <TableHead className="text-white font-semibold">Images</TableHead>
                        <TableHead className="text-white font-semibold">Cost per Image</TableHead>
                        <TableHead className="text-white font-semibold">Notes</TableHead>
                        <TableHead className="text-right text-white font-semibold">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-gray-700 hover:bg-gray-800/50">
                        <TableCell className="font-medium text-white">Basic</TableCell>
                        <TableCell className="text-white">$30</TableCell>
                        <TableCell className="text-white">10</TableCell>
                        <TableCell className="text-white">$3.00</TableCell>
                        <TableCell className="text-white">Starter</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            onClick={() => handleSubscribe('basic')} 
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700"
                            size="sm"
                          >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Subscribe
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-gray-700 hover:bg-gray-800/50">
                        <TableCell className="font-medium text-white">Pro</TableCell>
                        <TableCell className="text-white">$40</TableCell>
                        <TableCell className="text-white">20</TableCell>
                        <TableCell className="text-white">$2.00</TableCell>
                        <TableCell className="text-white">Better Value</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            onClick={() => handleSubscribe('pro')} 
                            disabled={isLoading}
                            className="bg-purple-600 hover:bg-purple-700"
                            size="sm"
                          >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Subscribe
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-gray-700 hover:bg-gray-800/50">
                        <TableCell className="font-medium text-white">
                          <div className="flex items-center gap-2">
                            Elite
                            <Star className="h-4 w-4 text-yellow-400" />
                          </div>
                        </TableCell>
                        <TableCell className="text-white">$75</TableCell>
                        <TableCell className="text-white">50</TableCell>
                        <TableCell className="text-white">$1.50</TableCell>
                        <TableCell className="text-white">
                          <div className="flex items-center gap-1">
                            Best Value ⭐
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            onClick={() => handleSubscribe('elite')} 
                            disabled={isLoading}
                            className="bg-pink-600 hover:bg-pink-700"
                            size="sm"
                          >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Subscribe
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add-on Token Packs for Subscribed Users */}
      {subscription && (
        <Card className="bg-[#1c1c1c] border-gray-800 text-white">
          <CardHeader>
            <CardTitle>Additional Token Packs</CardTitle>
            <CardDescription>Purchase extra tokens when you need more image generations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-gray-800/50">
                    <TableHead className="text-white font-semibold">Token Pack</TableHead>
                    <TableHead className="text-white font-semibold">Price</TableHead>
                    <TableHead className="text-white font-semibold">Tokens (Images)</TableHead>
                    <TableHead className="text-right text-white font-semibold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-gray-700 hover:bg-gray-800/50">
                    <TableCell className="font-medium text-white">Mini</TableCell>
                    <TableCell className="text-white">$10</TableCell>
                    <TableCell className="text-white">3 tokens</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        onClick={() => handleSubscribe('mini')} 
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Purchase
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-gray-700 hover:bg-gray-800/50">
                    <TableCell className="font-medium text-white">Standard</TableCell>
                    <TableCell className="text-white">$20</TableCell>
                    <TableCell className="text-white">6 tokens</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        onClick={() => handleSubscribe('standard')} 
                        disabled={isLoading}
                        className="bg-purple-600 hover:bg-purple-700"
                        size="sm"
                      >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Purchase
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-gray-700 hover:bg-gray-800/50">
                    <TableCell className="font-medium text-white">Plus</TableCell>
                    <TableCell className="text-white">$30</TableCell>
                    <TableCell className="text-white">10 tokens</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        onClick={() => handleSubscribe('plus')} 
                        disabled={isLoading}
                        className="bg-pink-600 hover:bg-pink-700"
                        size="sm"
                      >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Purchase
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {isLoadingData ? (
        <Card className="bg-[#1c1c1c] border-gray-800 text-white">
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-400">Loading billing information...</span>
          </CardContent>
        </Card>
      ) : subscription ? (
        <Card className="bg-[#1c1c1c] border-gray-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>
                {subscription.plan.nickname} - {subscription.plan.interval}ly billing
              </CardDescription>
            </div>
            <Button onClick={handleManageSubscription} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
              Manage Subscription
            </Button>
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
          </CardContent>
        </Card>
      ) : null}

      {stripeCustomer ? (
        <Card className="bg-[#1c1c1c] border-gray-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Update your payment details</CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={handleUpdatePaymentMethod}
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
