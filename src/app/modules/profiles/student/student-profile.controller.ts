import { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { studentProfileService } from "./student-profile.service";
import { ICreateStudentProfilePayload } from "./student-profile.interface";



const getAllStudentProfile = catchAsync(async (req: Request, res: Response) => {
	if (!req.user) {
		throw new Error("User is not authenticated");
	}


	const {data, meta} = await studentProfileService.getAllStudentProfileFromBD(req.query);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Users Profile retived Successfully",
		data: data,
		meta: meta,
	});
});





const createStudentProfile = catchAsync(async (req: Request, res: Response) => {
	if (!req.user) {
		throw new Error("User is not authenticated");
	}

	const userId = req.user?.id as string;
	const payload: ICreateStudentProfilePayload = req.body;

	const result = await studentProfileService.createStudentProfile(
		userId,
		payload,
	);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Student Profile Created Successfully",
		data: result,
	});
});

export const studentProfileController = {
	createStudentProfile,
	getAllStudentProfile,

};
