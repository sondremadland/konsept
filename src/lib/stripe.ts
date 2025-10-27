/*
 * STRIPE INTEGRATION - PHASE 2
 *
 * This file contains the Stripe payment integration code.
 * It is currently commented out and prepared for future use.
 *
 * To enable Stripe payments:
 * 1. Uncomment the code below
 * 2. Add VITE_STRIPE_PUBLISHABLE_KEY to .env
 * 3. Create a Supabase Edge Function for server-side payment intent creation
 * 4. Update ConceptDetail.tsx to use createPaymentIntent() instead of direct order creation
 *
 * Security notes:
 * - Never expose Stripe secret key on client side
 * - Always create payment intents server-side (via Edge Function)
 * - Verify payment status before granting access
 */

// import { loadStripe, Stripe } from '@stripe/stripe-js';
// import { supabase } from '@/integrations/supabase/client';

// let stripePromise: Promise<Stripe | null>;

// export const getStripe = () => {
//   if (!stripePromise) {
//     const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
//     if (!publishableKey) {
//       console.error('Stripe publishable key is not configured');
//       return null;
//     }
//     stripePromise = loadStripe(publishableKey);
//   }
//   return stripePromise;
// };

// interface CreatePaymentIntentParams {
//   conceptId: string;
//   amount: number;
//   userId: string;
//   userEmail: string;
//   userName: string;
// }

// export const createPaymentIntent = async (params: CreatePaymentIntentParams) => {
//   try {
//     const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`;
//     const { data: { session } } = await supabase.auth.getSession();

//     if (!session) {
//       throw new Error('No active session');
//     }

//     const response = await fetch(apiUrl, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${session.access_token}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         conceptId: params.conceptId,
//         amount: params.amount,
//         userId: params.userId,
//         userEmail: params.userEmail,
//         userName: params.userName,
//       }),
//     });

//     if (!response.ok) {
//       throw new Error('Failed to create payment intent');
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error creating payment intent:', error);
//     throw error;
//   }
// };

// export const confirmPayment = async (paymentIntentId: string, orderId: string) => {
//   try {
//     const stripe = await getStripe();
//     if (!stripe) {
//       throw new Error('Stripe not initialized');
//     }

//     const { error, paymentIntent } = await stripe.confirmPayment({
//       clientSecret: paymentIntentId,
//       confirmParams: {
//         return_url: `${window.location.origin}/dashboard`,
//       },
//     });

//     if (error) {
//       throw error;
//     }

//     return paymentIntent;
//   } catch (error) {
//     console.error('Error confirming payment:', error);
//     throw error;
//   }
// };

export {};
