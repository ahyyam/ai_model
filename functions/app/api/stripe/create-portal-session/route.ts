import { type NextRequest, NextResponse } from "next/server"
import { createPortalSession } from "@/lib/stripe"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"

export async function POST(request: NextRequest) {
  try {
    const { customer_id, return_url } = await request.json()

    if (!customer_id) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    // Check if customer_id is a placeholder
    if (customer_id === "cus_placeholder") {
      return NextResponse.json({ 
        error: "Invalid customer ID. Please set up your Stripe customer account first." 
      }, { status: 400 })
    }

    const session = await createPortalSession({
      customerId: customer_id,
      returnUrl: return_url || `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating portal session:", error)
    return NextResponse.json({ 
      error: "Failed to create portal session. Please check your Stripe configuration." 
    }, { status: 500 })
  }
}
