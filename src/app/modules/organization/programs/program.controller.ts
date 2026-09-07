import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { programsService } from "./program.service";

const createProgram = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	const result = await programsService.createProgram(payload);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Faculty Created Successfully",
		data: result,
	});
});









export const programsController = {
	createProgram,
};
