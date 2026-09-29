// import { Request, Response } from "express";
// import { catchAsync } from "../../utils/catchAsync";
// import { sendResponse } from "../../utils/sendResponse";
// import httpStatus from "http-status";
// import { prisma } from "../../lib/prisma";



// const getAllUsersBySuperAdmin = catchAsync(async (req: Request, res: Response) => {
// 	if (!req.user) {
// 		throw new Error("User is not authenticated");
// 	}

// 	const userId = req.user?.id as string;
	
// 	const result = await prisma.user;

// 	sendResponse(res, {
// 		statusCode: httpStatus.CREATED,
// 		success: true,
// 		message: "Student Profile Created Successfully",
// 		data: result,
// 	});
// });




// export const usersController = {
// 	getAllUsersBySuperAdmin,
// };


















import { Request, Response } from "express";
import httpStatus from "http-status";
import { z } from "zod";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { usersService } from "./user.service";
import { Role } from "../../../generated/prisma/enums";

const getAllUsersQuerySchema = z.object({
    page: z.coerce
        .number()
        .int()
        .positive()
        .optional(),

    limit: z.coerce
        .number()
        .int()
        .positive()
        .max(100)
        .optional(),

    sortBy: z.string().optional(),

    sortOrder: z
        .enum(["asc", "desc"])
        .optional(),

    searchTerm: z
        .string()
        .trim()
        .optional(),

    role: z
        .nativeEnum(Role)
        .optional(),

    isActive: z
        .enum(["true", "false"])
        .transform((value) => value === "true")
        .optional(),
});

const getAllUsersBySuperAdmin = catchAsync(
    async (req: Request, res: Response) => {
        if (!req.user) {
            throw new Error("User is not authenticated");
        }

        const query = getAllUsersQuerySchema.parse(req.query);

        const result = await usersService.getAllUsersFromDB(query);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Users retrieved successfully",
            data: result,
        });
    },
);

export const usersController = {
    getAllUsersBySuperAdmin,
};