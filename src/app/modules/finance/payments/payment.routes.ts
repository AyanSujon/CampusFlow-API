import express from "express";
import { auth } from "../../../middleware/checkAuth";
import { paymentController } from "./payment.controller";

// import auth from "../../middleware/auth";
// import validateRequest from "../../middleware/validateRequest";

// import * as PaymentController from "./payment.controller";
// import { PaymentValidation } from "./payment.validation";

const router = express.Router();

// Create payment
router.post(
	"/create",
	auth("STUDENT"),
	// validateRequest(PaymentValidation.createPaymentValidationSchema),
	paymentController.createPayment,
);

// // Create Stripe checkout session
// router.post(
// 	"/checkout",
// 	auth("STUDENT"),
// 	validateRequest(PaymentValidation.createCheckoutValidationSchema),
// 	PaymentController.createCheckout,
// );

// // Get logged-in student's payments
// router.get(
// 	"/my-payments",
// 	auth("STUDENT"),
// 	PaymentController.getMyPayments,
// );

// // Get single payment
// router.get(
// 	"/:id",
// 	auth("STUDENT", "ACCOUNTANT", "ADMIN"),
// 	PaymentController.getPaymentById,
// );

export const paymentRoutes = router;

