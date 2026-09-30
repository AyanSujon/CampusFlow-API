import { InstructorProfileWhereInput } from "../../../../generated/prisma/models";
import { IQuery } from "../../../interface";
import { prisma } from "../../../lib/prisma";





const getAllStudentProfileFromBD = async (query: IQuery) => {
	const limit = query.limit ? Number(query.limit) : 10;
	const page = query.page ? Number(query.page) : 1;
	const skip = (page - 1) * limit;
	const sortBy = query.sortBy ? query.sortBy : "createdAt";
	const sortOrder = query.sortOrder ? query.sortOrder : "desc";

	const andConditions: InstructorProfileWhereInput[] = [];

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
					specialization: {
						contains: query.searchTerm,
						mode: "insensitive",
					},
				},
				{
					employeeId: {
						contains: query.searchTerm,
						mode: "insensitive",
					},
				},
			],
		});
	}

	//filtering

	if (query.qualification) {
		andConditions.push({
			qualification: { equals: query.programId, mode: "insensitive" },
		});
	}


	if (query.employmentStatus) {
		andConditions.push({
			employmentStatus: { equals: query.programId},
		});
	}

	if (query.verificationStatus) {
		andConditions.push({
			verificationStatus: { equals: query.email },
		});
	}

	if (query.joiningDate) {
		andConditions.push({
			joiningDate: { equals: query.academicStatus },
		});
	}

	if (query.yearsOfExperience) {
		andConditions.push({
			yearsOfExperience: { equals: query.yearsOfExperience },
		});
	}


	const allInstructor = await prisma.instructorProfile.findMany({
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
		},
	});

	const totalInstructorCount = await prisma.instructorProfile.count({
		where: {
			AND: andConditions,
		},
	});

	return {
		data: allInstructor,
		meta: {
			page: page,
			limit: limit,
			total: totalInstructorCount,
			totalPages: Math.ceil(totalInstructorCount / limit),
		},
	};
};
















export const instructorProfileService ={
    getAllStudentProfileFromBD,

}