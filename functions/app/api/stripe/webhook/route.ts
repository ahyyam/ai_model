import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
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
        const subscriptionCreated = event.data.object
        console.log("Subscription created:", subscriptionCreated.id)
        // Handle new subscription - update user's subscription status in your database
        break

      case "customer.subscription.updated":
        const subscriptionUpdated = event.data.object
        console.log("Subscription updated:", subscriptionUpdated.id)
        // Handle subscription updates - update user's subscription status in your database
        break

      case "customer.subscription.deleted":
        const subscriptionDeleted = event.data.object
        console.log("Subscription deleted:", subscriptionDeleted.id)
        // Handle subscription cancellation - update user's subscription status in your database
        break

      case "invoice.payment_succeeded":
        const paymentSucceeded = event.data.object
        console.log("Payment succeeded:", paymentSucceeded.id)
        // Handle successful payment
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