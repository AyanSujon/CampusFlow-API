import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { departmentsService } from "./department.service";

const createDepartment = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	const result = await departmentsService.createDepartment(payload);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Faculty Created Successfully",
		data: result,
	});
});




















export const departmentsController = {
    createDepartment,


}