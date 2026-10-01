import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { instructorProfileService } from "./instructors.service";




const createInstructorProfile = catchAsync(async (req: Request, res: Response) => {
	if (!req.user) {
		throw new Error("User is not authenticated");
	}	

	const result = await instructorProfileService.createInstructorProfileInDB(req.body);	

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,	
		message: "Instructor Profile created Successfully",
		data: result,
	});
});	



const getAllInstructorsProfile = catchAsync(async (req: Request, res: Response) => {
	if (!req.user) {
		throw new Error("User is not authenticated");
	}


	const {data, meta} = await instructorProfileService.getAllInstructorProfileFromDB(req.query);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Instructor Profile retived Successfully",
		data: data,
		meta: meta,
	});
});








export const instructorsProfileController = {
    createInstructorProfile,
    getAllInstructorsProfile,
}