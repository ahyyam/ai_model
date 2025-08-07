import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"
import { adminDb } from "@/lib/firebase-admin"

// Credit allocation based on subscription plans
const PLAN_CREDITS = {
  BASIC: 10,
  PRO: 20,
  ELITE: 50,
  MINI: 5,
  STANDARD: 15,
  PLUS: 25
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  if (!stripe) {
    return NextResponse.json({ error: "Stripe not initialized" }, { status: 500 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
        const subscriptionCreated = event.data.object as any
        console.log("Subscription created:", subscriptionCreated.id)
        
        // Get customer email and find user
        const customer = await stripe.customers.retrieve(subscriptionCreated.customer as string) as any
        if (customer.email) {
          // Find user by email
          const usersRef = adminDb.collection('users')
          const q = usersRef.where('email', '==', customer.email)
          const querySnapshot = await q.get()
          
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0]
            const userId = userDoc.id
            const userData = userDoc.data()
            
            // Determine plan and credits
            const priceId = subscriptionCreated.items.data[0]?.price?.id
            let planName = 'BASIC'
            let credits = PLAN_CREDITS.BASIC
            
            // Map price ID to plan
            if (priceId === process.env.STRIPE_BASIC_PRICE_ID) {
              planName = 'BASIC'
              credits = PLAN_CREDITS.BASIC
            } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
              planName = 'PRO'
              credits = PLAN_CREDITS.PRO
            } else if (priceId === process.env.STRIPE_ELITE_PRICE_ID) {
              planName = 'ELITE'
              credits = PLAN_CREDITS.ELITE
            }
            
            // Update user data
            await userDoc.ref.update({
              stripeCustomerId: customer.id,
              subscriptionStatus: planName.toLowerCase(),
              credits: (userData.credits || 0) + credits,
              updatedAt: new Date().toISOString()
            })
            
            console.log(`Updated user ${userId} with ${credits} credits for ${planName} plan`)
          }
        }
        break

      case "customer.subscription.updated":
        const subscriptionUpdated = event.data.object as any
        console.log("Subscription updated:", subscriptionUpdated.id)
        
        // Handle subscription updates (plan changes, etc.)
        const customerUpdated = await stripe.customers.retrieve(subscriptionUpdated.customer as string) as any
        if (customerUpdated.email) {
          const usersRef = adminDb.collection('users')
          const q = usersRef.where('email', '==', customerUpdated.email)
          const querySnapshot = await q.get()
          
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0]
            const userId = userDoc.id
            
            // Update subscription status
            const priceId = subscriptionUpdated.items.data[0]?.price?.id
            let planName = 'BASIC'
            
            if (priceId === process.env.STRIPE_BASIC_PRICE_ID) {
              planName = 'BASIC'
            } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
              planName = 'PRO'
            } else if (priceId === process.env.STRIPE_ELITE_PRICE_ID) {
              planName = 'ELITE'
            }
            
            await userDoc.ref.update({
              subscriptionStatus: planName.toLowerCase(),
              updatedAt: new Date().toISOString()
            })
          }
        }
        break

      case "customer.subscription.deleted":
        const subscriptionDeleted = event.data.object as any
        console.log("Subscription deleted:", subscriptionDeleted.id)
        
        // Handle subscription cancellation
        const customerDeleted = await stripe.customers.retrieve(subscriptionDeleted.customer as string) as any
        if (customerDeleted.email) {
          const usersRef = adminDb.collection('users')
          const q = usersRef.where('email', '==', customerDeleted.email)
          const querySnapshot = await q.get()
          
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0]
            const userId = userDoc.id
            
            await userDoc.ref.update({
              subscriptionStatus: 'free',
              updatedAt: new Date().toISOString()
            })
          }
        }
        break

      case "invoice.payment_succeeded":
        const paymentSucceeded = event.data.object as any
        console.log("Payment succeeded:", paymentSucceeded.id)
        
        // Handle successful payment - add credits for recurring subscriptions
        if (paymentSucceeded.subscription) {
          const customer = await stripe.customers.retrieve(paymentSucceeded.customer as string) as any
          if (customer.email) {
            const usersRef = adminDb.collection('users')
            const q = usersRef.where('email', '==', customer.email)
            const querySnapshot = await q.get()
            
            if (!querySnapshot.empty) {
              const userDoc = querySnapshot.docs[0]
              const userId = userDoc.id
              const userData = userDoc.data()
              
              // Get subscription details
              const subscription = await stripe.subscriptions.retrieve(paymentSucceeded.subscription)
              const priceId = subscription.items.data[0]?.price?.id
              let credits = 0
              
              // Add credits based on plan
              if (priceId === process.env.STRIPE_BASIC_PRICE_ID) {
                credits = PLAN_CREDITS.BASIC
              } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
                credits = PLAN_CREDITS.PRO
              } else if (priceId === process.env.STRIPE_ELITE_PRICE_ID) {
                credits = PLAN_CREDITS.ELITE
              }
              
              if (credits > 0) {
                await userDoc.ref.update({
                  credits: (userData.credits || 0) + credits,
                  updatedAt: new Date().toISOString()
                })
                console.log(`Added ${credits} credits to user ${userId} for payment`)
              }
            }
          }
        }
        break

      case "invoice.payment_failed":
        const paymentFailed = event.data.object
        console.log("Payment failed:", paymentFailed.id)
        // Handle failed payment
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
} 