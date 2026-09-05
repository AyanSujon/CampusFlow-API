import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { PaymentService } from "./payment.service";
import { AppError } from "../../../utils/AppError";
// import { paymentService } from "./payment.service";



const createPayment = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const id = req.user?.id;

	if (!id) {
    throw new AppError(
        httpStatus.UNAUTHORIZED,
        "User ID not found. Please log in again."
    );
}


	console.log("userId:", id);
	const result = await PaymentService.createPayment(id as string, payload);

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


