import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { invoiceValidation } from "./invoices/invoice.validation";
import { invoiceController } from "./invoices/invoice.controller";
import { paymentRoutes } from "./payments/payment.routes";

const router = Router();

router.use(
	"/invoices",
	validateRequest(invoiceValidation.createInvoiceZodSchema),
	invoiceController.createInvoice,
);
router.use("/payments", paymentRoutes);

export const financeRoutes = router;
