
import httpStatus from "http-status";
import { prisma } from "../../../lib/prisma";
import { AppError } from "../../../utils/AppError";
import type { ICreateProgramPayload } from "./program.interface";

const createProgram = async (payload: ICreateProgramPayload) => {
	const {
		departmentId,
		code,
		name,
		degreeType,
		durationYears,
		totalCredits,
		description,
	} = payload;

	// Check if department exists
	const department = await prisma.department.findUnique({
		where: {
			id: departmentId,
		},
		select: {
			id: true,
			isDeleted: true,
		},
	});

	if (!department || department.isDeleted) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Department not found or has been deleted",
		);
	}

	// Check duplicate program code
	const existingProgram = await prisma.program.findUnique({
		where: {
			code,
		},
		select: {
			id: true,
		},
	});

	if (existingProgram) {
		throw new AppError(
			httpStatus.CONFLICT,
			`Program with code "${code}" already exists`,
		);
	}

	// Create program
	const program = await prisma.program.create({
		data: {
			departmentId,
			code,
			name,
			degreeType,
			durationYears,
			totalCredits,
			description,
		},
		select: {
			id: true,
			code: true,
			name: true,
			degreeType: true,
			durationYears: true,
			totalCredits: true,
			description: true,
			isActive: true,
			isDeleted: true,
			createdAt: true,
			updatedAt: true,
			department: {
				select: {
					id: true,
					code: true,
					name: true,
				},
			},
		},
	});

	return program;
};





const getAllPrograms = async () => {
	const programs = await prisma.program.findMany({
		where: {
			isDeleted: false,
		},
		select: {
			id: true,
			code: true,
			name: true,
			degreeType: true,
			durationYears: true,
			totalCredits: true,
			description: true,
			isActive: true,
			createdAt: true,
			updatedAt: true,

			department: {
				select: {
					id: true,
					code: true,
					name: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return programs;
};








export const programsService = {
	createProgram,
    getAllPrograms,

};
