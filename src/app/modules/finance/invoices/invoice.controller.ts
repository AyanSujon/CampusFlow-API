import { Request, Response } from "express";
import httpStatus from "http-status";
import { sendResponse } from "../../../utils/sendResponse";
import { catchAsync } from "../../../utils/catchAsync";
import { InvoiceService } from "./invoice.service";


const createInvoice = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	const result = await InvoiceService.createInvoice(payload);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Invoice Created Successfully",
		data: result,
	});
});

export const InvoiceController = {
	createInvoice,
};