import { NextRequest, NextResponse } from 'next/server'
import { getStripeCustomer, getCustomerInvoices } from '@/lib/stripe-customer'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const action = searchParams.get('action')

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    if (action === 'invoices') {
      const invoices = await getCustomerInvoices(customerId)
      return NextResponse.json({ invoices })
    } else {
      const customer = await getStripeCustomer(customerId)
      return NextResponse.json({ customer })
    }
  } catch (error) {
    console.error('Error in customer API route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer data' },
      { status: 500 }
    )
  }
} 