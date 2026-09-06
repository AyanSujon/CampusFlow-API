import httpStatus from "http-status";

import { prisma } from "../../../lib/prisma";
import { AppError } from "../../../utils/AppError";
import { CreateDepartmentPayload } from "./department.interface";
import { Role } from "../../../../generated/prisma/enums";

const createDepartment = async (payload: CreateDepartmentPayload) => {
	const {
		facultyId,
		code,
		name,
		description,
		headUserId,
	} = payload;

	// 1. Check faculty exists
	const faculty = await prisma.faculty.findFirst({
		where: {
			id: facultyId,
			isDeleted: false,
			isActive: true,
		},
	});

	if (!faculty) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Faculty not found or inactive",
		);
	}

	// 2. Check duplicate department code
	const existingDepartment = await prisma.department.findUnique({
		where: {
			code,
		},
	});

	if (existingDepartment) {
		throw new AppError(
			httpStatus.CONFLICT,
			"A department with this code already exists",
		);
	}

	// 3. Validate department head if provided
	if (headUserId) {
		const headUser = await prisma.user.findUnique({
			where: {
				id: headUserId,
			},
			select: {
				id: true,
				role: true,
				departmentId: true,
			},
		});

		if (!headUser) {
			throw new AppError(
				httpStatus.NOT_FOUND,
				"Department head user not found",
			);
		}

		// User must have DEPARTMENT_HEAD role
		if (headUser.role !== Role.DEPARTMENT_HEAD) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Selected user is not a Department Head",
			);
		}

		// User must belong to this department.
		// IMPORTANT:
		// At department creation time, department does not exist yet,
		// so headUser.departmentId cannot equal this new department ID.
		//
		// Therefore, if your business flow requires assigning the head
		// during department creation, this validation should happen
		// AFTER the department is created.
	}

	// 4. Create department
	const department = await prisma.department.create({
		data: {
			facultyId,
			code,
			name,
			description,
			headUserId: headUserId ?? null,
		},
		include: {
			faculty: {
				select: {
					id: true,
					code: true,
					name: true,
				},
			},
			head: {
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
				},
			},
		},
	});

	return department;
};

export const departmentsService = {
	createDepartment,
};