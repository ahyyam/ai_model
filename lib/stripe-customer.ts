import { stripe } from './stripe'

export interface StripeCustomer {
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

export async function createStripeCustomer(email: string, name?: string): Promise<StripeCustomer> {
  if (!stripe) {
    throw new Error('Stripe is not initialized')
  }
  
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        source: 'modelix_ai',
      },
    })

    return {
      id: customer.id,
      email: customer.email!,
      name: customer.name || undefined,
    }
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    throw error
  }
}

export async function getStripeCustomer(customerId: string): Promise<StripeCustomer | null> {
  if (!stripe) {
    throw new Error('Stripe is not initialized')
  }
  
  try {
    const customer = await stripe.customers.retrieve(customerId)
    
    if (customer.deleted) {
      return null
    }

    // Get active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    })

    const subscription = subscriptions.data[0]

    return {
      id: customer.id,
      email: customer.email!,
      name: customer.name || undefined,
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        current_period_end: (subscription as any).current_period_end || 0,
        plan: {
          nickname: (subscription.items.data[0]?.price as any)?.nickname || 'Unknown Plan',
          amount: subscription.items.data[0]?.price.unit_amount || 0,
          currency: subscription.items.data[0]?.price.currency || 'usd',
          interval: (subscription.items.data[0]?.price.recurring as any)?.interval || 'month',
        },
      } : undefined,
    }
  } catch (error) {
    console.error('Error retrieving Stripe customer:', error)
    return null
  }
}

export async function updateStripeCustomer(customerId: string, updates: {
  email?: string
  name?: string
}): Promise<StripeCustomer> {
  if (!stripe) {
    throw new Error('Stripe is not initialized')
  }
  
  try {
    const customer = await stripe.customers.update(customerId, updates)

    return {
      id: customer.id,
      email: customer.email!,
      name: customer.name || undefined,
    }
  } catch (error) {
    console.error('Error updating Stripe customer:', error)
    throw error
  }
}

export async function getCustomerInvoices(customerId: string, limit = 10) {
  if (!stripe) {
    throw new Error('Stripe is not initialized')
  }
  
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
    })

    return invoices.data.map(invoice => ({
      id: invoice.id,
      created: invoice.created,
      amount_paid: invoice.amount_paid,
      status: invoice.status,
      hosted_invoice_url: invoice.hosted_invoice_url,
    }))
  } catch (error) {
    console.error('Error retrieving customer invoices:', error)
    return []
  }
} 