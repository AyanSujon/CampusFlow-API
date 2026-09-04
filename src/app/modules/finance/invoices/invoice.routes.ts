import { Router } from "express";
import { invoiceValidation } from "./invoice.validation";
import { validateRequest } from "../../../middleware/validateRequest";
import { invoiceController } from "./invoice.controller";



const router = Router();






router.post("/create",
    validateRequest(invoiceValidation.createInvoiceZodSchema),
    invoiceController.createInvoice
     );








export const financeRoutes = router;
