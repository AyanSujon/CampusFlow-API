import httpStatus from "http-status";
import { prisma } from "../../../lib/prisma";
import { AppError } from "../../../utils/AppError";
import { ICreateStudentProfilePayload } from "./student-profile.interface";
import { IQuery } from "../../../interface";
import { StudentProfileWhereInput } from "../../../../generated/prisma/models";




// Filter Options: 
// /api/v1/profiles/student/all
// /api/v1/profiles/student/all?page=1&limit=10
// /api/v1/profiles/student/all?searchTerm=ayan
// /api/v1/profiles/student/all?studentId=STU-2026-CSE-0001
// /api/v1/profiles/student/all?programId=PROGRAM_UUID
// /api/v1/profiles/student/all?academicStatus=ACTIVE
// /api/v1/profiles/student/all?currentSemesterNo=5
// /api/v1/profiles/student/all?gender=MALE
// /api/v1/profiles/student/all?email=ayan@gmail.com
// /api/v1/profiles/student/all?sortBy=createdAt&sortOrder=desc
// /api/v1/profiles/student/all?page=1&limit=10&searchTerm=ayan&academicStatus=ACTIVE&currentSemesterNo=5&gender=MALE&sortBy=createdAt&sortOrder=desc

const getAllStudentProfileFromBD = async (query: IQuery) => {
	const limit = query.limit ? Number(query.limit) : 10;
	const page = query.page ? Number(query.page) : 1;
	const skip = (page - 1) * limit;
	const sortBy = query.sortBy ? query.sortBy : "createdAt";
	const sortOrder = query.sortOrder ? query.sortOrder : "desc";

	const andConditions: StudentProfileWhereInput[] = [];

	//Searching
	if (query.searchTerm) {
		andConditions.push({
			OR: [
				{ name: { contains: query.searchTerm, mode: "insensitive" } },
				{ email: { contains: query.searchTerm, mode: "insensitive" } },
				{
					name: {
						contains: query.searchTerm,
						mode: "insensitive",
					},
				},
				{
					email: {
						contains: query.searchTerm,
						mode: "insensitive",
					},
				},
				{
					studentId: {
						contains: query.searchTerm,
						mode: "insensitive",
					},
				},
			],
		});
	}

	//filtering

	if (query.programId) {
		andConditions.push({
			programId: { equals: query.programId, mode: "insensitive" },
		});
	}

	if (query.email) {
		andConditions.push({
			email: { contains: query.email, mode: "insensitive" },
		});
	}

	if (query.academicStatus) {
		andConditions.push({
			academicStatus: { equals: query.academicStatus },
		});
	}
	if (query.currentSemesterNo) {
		andConditions.push({
			currentSemesterNo: { equals: query.currentSemesterNo },
		});
	}

	if (query.gender) {
		andConditions.push({
			gender: { equals: query.gender },
		});
	}

	if (query.admissionDate) {
		andConditions.push({
			admissionDate: { equals: query.admissionDate },
		});
	}

	if (query.createdAt) {
		andConditions.push({
			createdAt: { equals: query.createdAt },
		});
	}

	const allStudents = await prisma.studentProfile.findMany({
		where: {
			AND: andConditions.length > 0 ? andConditions : undefined,
		},
		take: limit,
		skip: skip,

		orderBy: {
			// sortBy : sortOrder
			[sortBy]: sortOrder,
		},

		include: {
			user: {
				omit: {
					password: true,
				},
			},
			program: true,
		},
	});

	const totalStudentCount = await prisma.studentProfile.count({
		where: {
			AND: andConditions,
		},
	});

	return {
		data: allStudents,
		meta: {
			page: page,
			limit: limit,
			total: totalStudentCount,
			totalPages: Math.ceil(totalStudentCount / limit),
		},
	};
};
















const createStudentProfile = async (
	userId: string,
	payload: ICreateStudentProfilePayload,
) => {
	const { programId, ...profileData } = payload;

	// Check user exists
	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
	});

	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found");
	}

	// Check whether profile already exists
	const existingProfile = await prisma.studentProfile.findUnique({
		where: {
			userId,
		},
	});

	if (existingProfile) {
		throw new AppError(
			httpStatus.CONFLICT,
			"Student profile already exists for this user",
		);
	}

	// If programId is provided, verify program exists
	if (programId) {
		const program = await prisma.program.findUnique({
			where: {
				id: programId,
			},
		});

		// if (!program) {
		// 	throw new AppError(
		// 		httpStatus.NOT_FOUND,
		// 		"Program not found",
		// 	);
		// }
	}

	// Create student profile
	const studentProfile = await prisma.studentProfile.create({
		data: {
			...profileData,

			user: {
				connect: {
					id: userId,
				},
			},

			// ...(programId && {
			// 	program: {
			// 		connect: {
			// 			id: programId,
			// 		},
			// 	},
			// }),
		},

		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
				},
			},
			program: true,
		},
	});

	return studentProfile;
};

export const studentProfileService = {
	createStudentProfile,
	getAllStudentProfileFromBD,
};
