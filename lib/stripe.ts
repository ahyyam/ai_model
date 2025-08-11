import Stripe from 'stripe'

let cachedStripe: Stripe | null = null

export function getStripe(): Stripe | null {
  if (cachedStripe) return cachedStripe
  
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    console.warn('STRIPE_SECRET_KEY is not set')
    return null
  }
  
  try {
    cachedStripe = new Stripe(key, {
      apiVersion: '2025-06-30.basil',
      typescript: true,
    })
    console.log('Stripe client initialized successfully')
    return cachedStripe
  } catch (error) {
    console.error('Failed to initialize Stripe client:', error)
    return null
  }
}

// Initialize Stripe client immediately
export const stripe = getStripe()

// Stripe product and price IDs - you'll need to create these in your Stripe dashboard
export const STRIPE_PRODUCTS = {
  BASIC: {
    name: 'Basic Plan',
    priceId: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic_placeholder',
    mode: 'subscription' as const,
  },
  PRO: {
    name: 'Pro Plan',
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_placeholder',
    mode: 'subscription' as const,
  },
  ELITE: {
    name: 'Elite Plan',
    priceId: process.env.STRIPE_ELITE_PRICE_ID || 'price_elite_placeholder',
    mode: 'subscription' as const,
  },
  MINI: {
    name: 'Mini Token Pack',
    priceId: process.env.STRIPE_MINI_PRICE_ID || 'price_mini_placeholder',
    mode: 'payment' as const,
  },
  STANDARD: {
    name: 'Standard Token Pack',
    priceId: process.env.STRIPE_STANDARD_PRICE_ID || 'price_standard_placeholder',
    mode: 'payment' as const,
  },
  PLUS: {
    name: 'Plus Token Pack',
    priceId: process.env.STRIPE_PLUS_PRICE_ID || 'price_plus_placeholder',
    mode: 'payment' as const,
  },
}

// Helper function to format prices
export const formatPrice = (amount: number, currency = 'usd') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

// Helper function to create checkout session
export const createCheckoutSession = async ({
  priceId,
  customerEmail,
  successUrl,
  cancelUrl,
  mode = 'subscription',
}: {
  priceId: string
  customerEmail: string
  successUrl: string
  cancelUrl: string
  mode?: 'subscription' | 'payment'
}) => {
  const stripe = getStripe()
  if (!stripe) {
    throw new Error('Stripe is not initialized')
  }
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      allow_promotion_codes: true,
    })
    return session
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

// Helper function to create customer portal session
export const createPortalSession = async ({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}) => {
  const stripe = getStripe()
  if (!stripe) {
    throw new Error('Stripe is not initialized')
  }
  
  console.log('Creating portal session for customer:', customerId, 'return URL:', returnUrl)
  
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
    console.log('Portal session created successfully:', session.id)
    return session
  } catch (error) {
    console.error('Error creating portal session in Stripe library:', error)
    
    // Log more details about the Stripe error
    if (error && typeof error === 'object') {
      const stripeError = error as any
      console.error('Stripe error type:', stripeError.type)
      console.error('Stripe error message:', stripeError.message)
      console.error('Stripe error code:', stripeError.code)
      console.error('Stripe error param:', stripeError.param)
    }
    
    throw error
  }
} 