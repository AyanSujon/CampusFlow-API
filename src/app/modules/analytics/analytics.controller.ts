import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { AnalyticsServices } from "./analytics.service";





const getSuperAdminAnalytics = catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;

    const result = await AnalyticsServices.getSuperAdminAnalytics(user );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Super Admin Analytics Retrieved Successfully",
        data: result,
    });
});















export const AnalyticsController = {
    getSuperAdminAnalytics,

};