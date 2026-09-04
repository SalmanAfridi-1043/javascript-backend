import Stripe from "stripe";
import env from "./env.config.js";

export const stripe = new Stripe(env.stripeSecretKey);

// payment configuration is not just calculations.
// The calculations (subtotal, tax, discount, total) happen in your backend.
// payment.js is needed because we'll later connect the backend to a real payment provider such as Stripe:

// Your Backend
// ↓
// payment.js
// ↓
// Stripe API
// ↓
// Payment

// In short: (like in shop etc we pay through stripe card)
// Stripe provides the actual payment processing. 💳

// Customer pays → Stripe processes the payment
// Stripe gives your backend payment status → success / failed
// You don't handle card details yourself
// Stripe charges transaction fees (for real payments); test mode is free
