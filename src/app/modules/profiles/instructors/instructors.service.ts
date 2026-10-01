import { Prisma } from "../../../../generated/prisma/client";
import { IQuery } from "../../../interface";
import { prisma } from "../../../lib/prisma";




const createInstructorProfileInDB = async (payload: Prisma.InstructorProfileCreateInput) => {
  const result = await prisma.instructorProfile.create({
	data: payload,
  });	

  return result;
}		













const getAllInstructorProfileFromDB = async (query: IQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  const andConditions: Prisma.InstructorProfileWhereInput[] = [];

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

  // =========================
  // Qualification
  // =========================
  if (query.qualification) {
    andConditions.push({
      qualification: {
        contains: query.qualification,
        mode: "insensitive",
      },
    });
  }

  // =========================
  // Employment Status
  // =========================
  if (query.employmentStatus) {
    andConditions.push({
      employmentStatus: query.employmentStatus,
    });
  }

  // =========================
  // Verification Status
  // =========================
  if (query.verificationStatus) {
    andConditions.push({
      verificationStatus: query.verificationStatus,
    });
  }

  // =========================
  // Years of Experience
  // =========================
  if (query.yearsOfExperience) {
    andConditions.push({
      yearsOfExperience: Number(query.yearsOfExperience),
    });
  }

  // =========================
  // Joining Date
  // =========================
  if (query.joiningDate) {
    const date = new Date(query.joiningDate);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    andConditions.push({
      joiningDate: {
        gte: date,
        lt: nextDay,
      },
    });
  }

  // =========================
  // Get instructors
  // =========================
  const allInstructor = await prisma.instructorProfile.findMany({
    where: {
      AND: andConditions,
    },

    take: limit,
    skip,

    orderBy: {
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


console.log("INSTRUCTORS:", allInstructor);
  // =========================
  // Count
  // =========================
  const totalInstructorCount =
    await prisma.instructorProfile.count({
      where: {
        AND: andConditions,
      },
    });

  return {
    data: allInstructor,

    meta: {
      page,
      limit,
      total: totalInstructorCount,
      totalPages: Math.ceil(
        totalInstructorCount / limit
      ),
    },
  };
};











export const instructorProfileService ={
	createInstructorProfileInDB,
    getAllInstructorProfileFromDB,

}