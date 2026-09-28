import {
	EnrollmentStatus,
	InstructorVerificationStatus,
	PaymentStatus,
	Role,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";

const getSuperAdminAnalytics = async (user: RequestUser) => {
	if (user.role !== Role.SUPER_ADMIN) {
		throw new Error("Unauthorized access: Super Admin privilege required");
	}
	//total Students
	const totalStudents = await prisma.user.count({
		where: {
			role: Role.STUDENT,
		},
	});
	//total Instractors
	const totalInstructors = await prisma.user.count({
		where: {
			role: Role.INSTRUCTOR,
		},
	});
	const totalPendingInstructorApplications =
		await prisma.instructorProfile.count({
			where: {
				verificationStatus: InstructorVerificationStatus.PENDING,
			},
		});

	const totalApprovedInstructor = await prisma.instructorProfile.count({
		where: {
			verificationStatus: InstructorVerificationStatus.APPROVED,
		},
	});
	const totalRejectedInstructor = await prisma.instructorProfile.count({
		where: {
			verificationStatus: InstructorVerificationStatus.REJECTED,
		},
	});

	const totalFaculties = await prisma.faculty.count({
		where: {
			isActive: true,
			isDeleted: false,
		},
	});

	const totalDepartments = await prisma.department.count({
		where: {
			isActive: true,
			isDeleted: false,
		},
	});

	const totalPrograms = await prisma.program.count({
		where: {
			isActive: true,
			isDeleted: false,
		},
	});

	const totalActiveCourses = await prisma.course.count({
		where: {
			isActive: true,
			isDeleted: false,
		},
	});

	const totalApprovedEnrollments = await prisma.studentEnrollment.count({
		where: {
			status: EnrollmentStatus.APPROVED,
		},
	});

	const totalPendingEnrollments = await prisma.studentEnrollment.count({
		where: {
			status: EnrollmentStatus.PENDING,
		},
	});
	const totalRejectedEnrollments = await prisma.studentEnrollment.count({
		where: {
			status: EnrollmentStatus.REJECTED,
		},
	});

	// 1. Get the current date and set it to the 1st day of the current month at 00:00:00
	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

	// 2. Query Prisma with the date range filter
	const revenueThisMonthResult = await prisma.payment.aggregate({
		where: {
			status: PaymentStatus.SUCCESS,
			createdAt: {
				gte: startOfMonth, // Filters records created on or after the 1st of this month
			},
		},
		_sum: {
			amount: true,
		},
	});
	// 3. Extract the total (defaults to 0 if no successful payments exist)
	const revenueThisMonth = revenueThisMonthResult._sum.amount ?? 0;

	const totalRefundResult = await prisma.payment.aggregate({
		where: {
			status: PaymentStatus.SUCCESS,
		},
		_sum: {
			amount: true,
		},
	});

	const totalRefunded = totalRefundResult._sum.amount?.toNumber() || 0;

	const totalRevenueResult = await prisma.payment.aggregate({
		where: {
			status: PaymentStatus.SUCCESS,
		},
		_sum: {
			amount: true,
		},
	});

	const totalRevenue =
		(totalRevenueResult._sum.amount?.toNumber() || 0) - totalRefunded;

	return {
		totalStudents,
		totalInstructors,
		totalPendingInstructorApplications,
		totalApprovedInstructor,
		totalRejectedInstructor,
		totalFaculties,
		totalDepartments,
		totalPrograms,
		totalActiveCourses,
		totalApprovedEnrollments,
		totalPendingEnrollments,
		totalRejectedEnrollments,
		revenueThisMonth,
		totalRevenue,
		totalRefunded,
	};
};

export const AnalyticsServices = {
	getSuperAdminAnalytics,
};
