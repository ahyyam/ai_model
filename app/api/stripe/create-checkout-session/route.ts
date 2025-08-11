import { type NextRequest, NextResponse } from "next/server"
import { createCheckoutSession, STRIPE_PRODUCTS } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  let plan: string | undefined
  let finalPriceId: string | undefined
  let mode: string | undefined
  let finalCustomerEmail: string | undefined

  try {
    const { plan: requestPlan, priceId, customerEmail, email, successUrl, cancelUrl } = await request.json()
    plan = requestPlan

    console.log('Received checkout session request:', { plan, priceId, customerEmail, email, successUrl, cancelUrl })

    // Handle both email and customerEmail field names
    finalCustomerEmail = customerEmail || email

    finalPriceId = priceId

    // If plan is provided, get the price ID from STRIPE_PRODUCTS
    if (plan && !priceId) {
      // Convert plan name to uppercase to match STRIPE_PRODUCTS keys
      const planKey = plan.toUpperCase() as keyof typeof STRIPE_PRODUCTS
      
      if (STRIPE_PRODUCTS[planKey]) {
        finalPriceId = STRIPE_PRODUCTS[planKey].priceId
      } else {
        console.error(`Invalid plan: ${plan}. Available plans:`, Object.keys(STRIPE_PRODUCTS))
        return NextResponse.json(
          { error: `Invalid plan: ${plan}. Available plans: ${Object.keys(STRIPE_PRODUCTS).join(', ')}` },
          { status: 400 }
        )
      }
    }

    if (!finalPriceId || !finalCustomerEmail) {
      return NextResponse.json(
        { error: "Price ID and customer email are required" },
        { status: 400 }
      )
    }

    // Check if the price ID is a placeholder (not a real Stripe price ID)
    if (finalPriceId.includes('placeholder')) {
      console.error('Stripe price ID is a placeholder:', finalPriceId)
      return NextResponse.json(
        { 
          error: "Stripe price IDs are not configured. Please set up your Stripe products and price IDs in the environment variables.",
          details: {
            currentPriceId: finalPriceId,
            requiredEnvVars: [
              'STRIPE_BASIC_PRICE_ID',
              'STRIPE_PRO_PRICE_ID', 
              'STRIPE_ELITE_PRICE_ID',
              'STRIPE_MINI_PRICE_ID',
              'STRIPE_STANDARD_PRICE_ID',
              'STRIPE_PLUS_PRICE_ID'
            ],
            instructions: "Create a .env file in your project root with the actual Stripe price IDs from your Stripe dashboard. See docs/stripe-setup.md for detailed instructions."
          }
        },
        { status: 400 }
      )
    }

    // Check if the user accidentally used a product ID instead of a price ID
    if (finalPriceId.startsWith('prod_')) {
      console.error('User provided product ID instead of price ID:', finalPriceId)
      return NextResponse.json(
        { 
          error: "You provided a Product ID instead of a Price ID. Please use the correct Price ID from your Stripe dashboard.",
          details: {
            providedId: finalPriceId,
            idType: 'Product ID (starts with prod_)',
            requiredType: 'Price ID (should start with price_)',
            instructions: "In your Stripe dashboard, go to Products → [Your Product] → Pricing → Copy the Price ID (starts with 'price_'). Do NOT use the Product ID (starts with 'prod_')."
          }
        },
        { status: 400 }
      )
    }

    // Validate that the price ID is one of our configured plans
    const validPriceIds = Object.values(STRIPE_PRODUCTS).map(product => product.priceId)
    if (!validPriceIds.includes(finalPriceId)) {
      console.error(`Invalid price ID: ${finalPriceId}. Valid IDs:`, validPriceIds)
      return NextResponse.json(
        { 
          error: `Invalid price ID: ${finalPriceId}`,
          details: {
            providedPriceId: finalPriceId,
            validPriceIds: validPriceIds,
            availableProducts: Object.keys(STRIPE_PRODUCTS)
          }
        },
        { status: 400 }
      )
    }

    // Get the product configuration to determine the mode
    const planKey = plan?.toUpperCase() as keyof typeof STRIPE_PRODUCTS
    const productConfig = planKey ? STRIPE_PRODUCTS[planKey] : null
    const mode = productConfig?.mode || 'subscription'

    // Determine success URL based on mode
    let finalSuccessUrl = successUrl
    if (!finalSuccessUrl) {
      if (mode === 'subscription') {
        // For subscriptions, redirect to billing success page
        finalSuccessUrl = `${request.headers.get('origin') || 'https://zarta.io'}/billing/success?plan=${plan}`
      } else {
        // For one-time payments (token packs), redirect to projects page
        finalSuccessUrl = `${request.headers.get('origin') || 'https://zarta.io'}/projects`
      }
    }

    console.log(`Creating checkout session for plan: ${plan}, priceId: ${finalPriceId}, email: ${finalCustomerEmail}, mode: ${mode}`)
    console.log('URLs received from frontend:', { successUrl, cancelUrl })
    console.log('Request origin header:', request.headers.get('origin'))
    console.log('Final URLs to be used:', { 
      successUrl: finalSuccessUrl,
      cancelUrl: cancelUrl || `${request.headers.get('origin') || 'https://zarta.io'}/billing?canceled=true`
    })

    const session = await createCheckoutSession({
      priceId: finalPriceId,
      customerEmail: finalCustomerEmail,
      successUrl: finalSuccessUrl,
      cancelUrl: cancelUrl || `${request.headers.get('origin') || 'https://zarta.io'}/billing?canceled=true`,
      mode: mode,
    })

    console.log('Successfully created checkout session:', { sessionId: session.id, url: session.url })
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    
    // Provide more detailed error information
    let errorMessage = "Failed to create checkout session"
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: {
          plan: plan,
          priceId: finalPriceId,
          mode: mode,
          customerEmail: finalCustomerEmail
        }
      },
      { status: 500 }
    )
  }
} 