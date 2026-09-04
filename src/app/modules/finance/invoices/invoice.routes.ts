import { Router } from "express";
import { InvoiceValidation } from "./invoice.validation";
import { validateRequest } from "../../../middleware/validateRequest";
import { InvoiceController } from "./invoice.controller";



const router = Router();






router.post("/invoices",
    validateRequest(InvoiceValidation.createInvoiceZodSchema),
    InvoiceController.createInvoice
     );









export const FinanceRoutes = router;
