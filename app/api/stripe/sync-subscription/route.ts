import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { adminDb } from '@/lib/firebase-admin'

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
  try {
    const { uid } = await request.json()

    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user data from Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get()
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userDoc.data()
    if (!userData?.stripeCustomerId) {
      return NextResponse.json({ error: 'No Stripe customer ID found' }, { status: 400 })
    }

    // Get customer data from Stripe
    const customer = await stripe?.customers.retrieve(userData.stripeCustomerId) as any
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found in Stripe' }, { status: 404 })
    }

    // Get active subscription
    const subscriptions = await stripe?.subscriptions.list({
      customer: userData.stripeCustomerId,
      status: 'active',
      limit: 1,
    })

    const subscription = subscriptions?.data[0]

    if (!subscription) {
      // No active subscription, update status to free
      await userDoc.ref.update({
        subscriptionStatus: 'free',
        updatedAt: new Date().toISOString()
      })

      return NextResponse.json({
        subscriptionStatus: 'free',
        credits: userData.credits || 0
      })
    }

    // Determine plan and credits based on price ID
    const priceId = subscription.items.data[0]?.price?.id
    let planName: 'basic' | 'pro' | 'elite' = 'basic'
    let credits = PLAN_CREDITS.BASIC

    if (priceId === process.env.STRIPE_BASIC_PRICE_ID) {
      planName = 'basic'
      credits = PLAN_CREDITS.BASIC
    } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
      planName = 'pro'
      credits = PLAN_CREDITS.PRO
    } else if (priceId === process.env.STRIPE_ELITE_PRICE_ID) {
      planName = 'elite'
      credits = PLAN_CREDITS.ELITE
    }

    // Update user data with current subscription status and credits
    const updatedData = {
      subscriptionStatus: planName,
      credits: Math.max(userData.credits || 0, credits), // Don't reduce credits if user already has more
      updatedAt: new Date().toISOString()
    }

    await userDoc.ref.update(updatedData)

    return NextResponse.json({
      subscriptionStatus: planName,
      credits: updatedData.credits,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
        plan: {
          nickname: (subscription.items.data[0]?.price as any)?.nickname || planName,
          amount: subscription.items.data[0]?.price.unit_amount || 0,
          currency: subscription.items.data[0]?.price.currency || 'usd',
          interval: (subscription.items.data[0]?.price.recurring as any)?.interval || 'month',
        }
      }
    })

  } catch (error) {
    console.error('Error syncing subscription:', error)
    return NextResponse.json(
      { error: 'Failed to sync subscription' },
      { status: 500 }
    )
  }
}
