// import Stripe from "stripe";
// import { stripe } from "./stripe.config";
// import httpStatus from "http-status";

// export const handleStripeWebhook = async (
//   req: Request,
//   res: Response
// ) => {

//   const signature =
//     req.headers["stripe-signature"];

//   if (!signature) {
//     return res.status(400).send(
//       "Missing Stripe signature"
//     );
//   }

//   let event: Stripe.Event;

//   try {

//     event = stripe.webhooks.constructEvent(
//       req.body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET!
//     );

//   } catch (error) {

//     return res.status(400).send(
//       `Webhook Error`
//     );
//   }

//   switch (event.type) {

//     case "checkout.session.completed": {

//       const session =
//         event.data.object as Stripe.Checkout.Session;

//       const paymentId =
//         session.metadata?.paymentId;

//       if (!paymentId) {
//         break;
//       }

//       await PaymentService.handleStripeSuccess(
//         paymentId,
//         session
//       );

//       break;
//     }

//     default:
//       break;
//   }

//   return res.status(200).json({
//     received: true,
//   });
// };