import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { invoiceValidation } from "./invoices/invoice.validation";
import { invoiceController } from "./invoices/invoice.controller";
import { paymentController } from "./payments/payment.controller";

const router = Router();

router.use(
	"/invoices",
	validateRequest(invoiceValidation.createInvoiceZodSchema),
	invoiceController.createInvoice,
);
router.use(
	"/payments",
	// validateRequest(paymentValidation.createPaymentZodSchema),
	paymentController.createPayment,
);



export const financeRoutes = router;
