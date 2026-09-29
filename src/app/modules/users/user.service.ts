// import { prisma } from "../../lib/prisma";

// const getAllUsersFromDB = async () => {
//     const result = await prisma.user.findMany({
//         select: {
//             id: true,
//             name: true,
//             email: true,
//             role: true,
//             isActive: true,
//             createdAt: true,
//             updatedAt: true,
//             // never select password
//         },
//         orderBy: {
//             createdAt: "desc",
//         },
//     });

//     return result;
// };








// import { Prisma } from "../../../generated/prisma/client";
// import { Role } from "../../../generated/prisma/enums";
// import { prisma } from "../../lib/prisma";

// type TGetAllUsersParams = {
//     page?: number;
//     limit?: number;
//     sortBy?: string;
//     sortOrder?: "asc" | "desc";
//     searchTerm?: string;
//     role?: Role;
//     isActive?: boolean;
// };

// // Only allow sorting on real, safe columns (never password, etc.)
// const SORTABLE_FIELDS = ["name", "email", "role", "isActive", "createdAt", "updatedAt"];

// const getAllUsersFromDB = async (params: TGetAllUsersParams = {}) => {
//     const page = Math.max(Number(params.page) || 1, 1);
//     const limit = Math.min(Math.max(Number(params.limit) || 10, 1), 100); // cap at 100
//     const skip = (page - 1) * limit;

//     const sortBy = SORTABLE_FIELDS.includes(params.sortBy ?? "")
//         ? (params.sortBy as string)
//         : "createdAt";
//     const sortOrder = params.sortOrder === "asc" ? "asc" : "desc";

//     const where: Prisma.UserWhereInput = {
//         isDeleted: false,
//         ...(params.role && { role: params.role }),
//         ...(typeof params.isActive === "boolean" && { isActive: params.isActive }),
//         ...(params.searchTerm && {
//             OR: [
//                 { name: { contains: params.searchTerm, mode: "insensitive" } },
//                 { email: { contains: params.searchTerm, mode: "insensitive" } },
//             ],
//         }),
//     };

//     const [data, total] = await Promise.all([
//         prisma.user.findMany({
//             where,
//             skip,
//             take: limit,
//             orderBy: { [sortBy]: sortOrder },
//             select: {
//                 id: true,
//                 name: true,
//                 email: true,
//                 role: true,
//                 isActive: true,
//                 createdAt: true,
//                 updatedAt: true,
//                 // never select password
//             },
//         }),
//         prisma.user.count({ where }),
//     ]);

//     return {
//         meta: {
//             page,
//             limit,
//             total,
//             totalPages: Math.ceil(total / limit),
//         },
//         data,
//     };
// };


// export const usersService = {
//     getAllUsersFromDB,
// };










// /users?page=1&limit=10
// /users?searchTerm=ayan
// /users?role=STUDENT
// /users?isActive=true
// /users?sortBy=createdAt&sortOrder=desc
// /users?page=1&limit=10&searchTerm=ayan
// /users?role=STUDENT&isActive=true
// /api/v1/users/all?page=1&limit=20&searchTerm=ayan&role=STUDENT&isActive=true&sortBy=createdAt&sortOrder=desc

import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { Role } from "../../../generated/prisma/enums";

type GetAllUsersQuery = {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    searchTerm?: string;
    role?: Role;
    isActive?: boolean;
};

const getAllUsersFromDB = async (query: GetAllUsersQuery) => {
    const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        searchTerm,
        role,
        isActive,
    } = query;

    const skip = (page - 1) * limit;

    const andConditions: Prisma.UserWhereInput[] = [];

    /*
     * Search
     */
    if (searchTerm) {
        andConditions.push({
            OR: [
                {
                    name: {
                        contains: searchTerm,
                        mode: "insensitive",
                    },
                },
                {
                    email: {
                        contains: searchTerm,
                        mode: "insensitive",
                    },
                },
            ],
        });
    }

    /*
     * Role filter
     */
    if (role) {
        andConditions.push({
            role,
        });
    }

    /*
     * Active status filter
     */
    if (isActive !== undefined) {
        andConditions.push({
            isActive,
        });
    }

    /*
     * Where condition
     */
    const where: Prisma.UserWhereInput =
        andConditions.length > 0
            ? {
                  AND: andConditions,
              }
            : {};

    /*
     * Fetch users + total count in parallel
     */
    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,

            orderBy: {
                [sortBy]: sortOrder,
            },

            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        }),

        prisma.user.count({
            where,
        }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
        data: users,
    };
};

export const usersService = {
    getAllUsersFromDB,
};

