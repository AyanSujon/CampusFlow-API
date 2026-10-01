import httpStatus from "http-status";
import { prisma } from "../../../lib/prisma";
import { AppError } from "../../../utils/AppError";
import { ICreateFacultyPayload } from "./faculty.interface";
import { Prisma } from "../../../../generated/prisma/client";
import { IQuery } from "../../../interface";

const createFaculty = async (payload: ICreateFacultyPayload) => {
	const { code, name, description, deanUserId } = payload;

	// Check if faculty already exists
	const existingFaculty = await prisma.faculty.findUnique({
		where: {
			code,
		},
	});

	if (existingFaculty) {
		throw new AppError(
			httpStatus.CONFLICT,
			"Faculty with this code already exists",
		);
	}

	// If deanUserId is provided, verify that user exists
	if (deanUserId) {
		const deanUser = await prisma.user.findUnique({
			where: {
				id: deanUserId,
			},
		});

		// if (!deanUser) {
		// 	throw new AppError(
		// 		httpStatus.NOT_FOUND,
		// 		"Dean user not found",
		// 	);
		// }
	}

	// Create faculty
	const faculty = await prisma.faculty.create({
		data: {
			code,
			name,
			description,
			deanUserId,
		},
		include: {
			dean: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	});

	return faculty;
};


// const getAllFaculties = async () => {
// 	const faculties = await prisma.faculty.findMany({
// 		select: {
// 			id: true,
// 			code: true,
// 			name: true,
// 			description: true,
// 			isActive: true,
// 			createdAt: true,
// 			updatedAt: true,

// 			dean: {
// 				select: {
// 					id: true,
// 					name: true,
// 					email: true,
// 				},
// 			},
// 		},
// 	});

// 	return faculties;
// };




const getAllFaculties = async (query: IQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  const andConditions: Prisma.FacultyWhereInput[] = [];

  // =========================
  // Search
  // =========================
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          code: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  // =========================
  // Active Status
  // =========================
  if (query.isActive !== undefined) {
    andConditions.push({
      isActive: query.isActive === "true",
    });
  }

  // =========================
  // Dean
  // =========================
  if (query.deanUserId) {
    andConditions.push({
      deanUserId: query.deanUserId,
    });
  }

  // =========================
  // Not Deleted
  // =========================
  andConditions.push({
    isDeleted: false,
  });

  // =========================
  // Get Faculties
  // =========================
  const faculties = await prisma.faculty.findMany({
    where: {
      AND: andConditions,
    },

    take: limit,
    skip,

    orderBy: {
      [sortBy]: sortOrder,
    },

    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      isActive: true,
      isDeleted: true,
      createdAt: true,
      updatedAt: true,

      dean: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // =========================
  // Count
  // =========================
  const totalFacultyCount = await prisma.faculty.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: faculties,

    meta: {
      page,
      limit,
      total: totalFacultyCount,
      totalPages: Math.ceil(totalFacultyCount / limit),
    },
  };
};




export const facultyService = {
	createFaculty,
	getAllFaculties,
};
