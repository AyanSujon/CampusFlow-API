import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { paymentService } from "./payment.service";



const createPayment = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	const result = await paymentService.createPayment(payload);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Payment Created Successfully",
		data: result,
	});
});

export const paymentController = {
	createPayment,
};


