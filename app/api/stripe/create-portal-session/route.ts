import { type NextRequest, NextResponse } from "next/server"
import { createPortalSession } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const { customer_id, return_url } = await request.json()

    if (!customer_id) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    console.log('Portal session request:', { customer_id, return_url })
    console.log('Request origin header:', request.headers.get('origin'))
    console.log('Final return URL to be used:', return_url || `${request.headers.get('origin') || 'https://zarta.io'}/billing`)

    // Check if customer_id is a placeholder
    if (customer_id === "cus_placeholder") {
      return NextResponse.json({ 
        error: "Invalid customer ID. Please set up your Stripe customer account first." 
      }, { status: 400 })
    }

    const session = await createPortalSession({
      customerId: customer_id,
      returnUrl: return_url || `${request.headers.get('origin') || 'https://zarta.io'}/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating portal session:", error)
    
    // Log more details about the error
    if (error && typeof error === 'object') {
      console.error("Error type:", (error as any).type)
      console.error("Error message:", (error as any).message)
      console.error("Error code:", (error as any).code)
      console.error("Error param:", (error as any).param)
    }
    
    // Check for specific Stripe portal configuration error
    if (error && typeof error === 'object' && 'type' in error) {
      const stripeError = error as any
      if (stripeError.type === 'StripeInvalidRequestError' && 
          stripeError.message?.includes('customer portal settings')) {
        return NextResponse.json({ 
          error: "Stripe customer portal not configured. Please contact support to set up billing management.",
          details: "The Stripe customer portal needs to be configured in the Stripe dashboard before customers can manage their subscriptions."
        }, { status: 500 })
      }
    }
    
    // Check for other common Stripe errors
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as any).message
      if (errorMessage.includes('customer portal')) {
        return NextResponse.json({ 
          error: "Stripe customer portal not configured. Please contact support to set up billing management.",
          details: "The Stripe customer portal needs to be configured in the Stripe dashboard before customers can manage their subscriptions."
        }, { status: 500 })
      }
    }
    
    // Check for specific Stripe error codes
    if (error && typeof error === 'object' && 'code' in error) {
      const errorCode = (error as any).code
      if (errorCode === 'parameter_invalid_string' || errorCode === 'parameter_missing') {
        return NextResponse.json({ 
          error: "Invalid customer ID provided. Please check your billing account.",
          details: "The customer ID format is invalid or missing."
        }, { status: 400 })
      }
    }
    
    return NextResponse.json({ 
      error: "Failed to create portal session. Please check your Stripe configuration.",
      details: "An unexpected error occurred while creating the billing portal session."
    }, { status: 500 })
  }
}
