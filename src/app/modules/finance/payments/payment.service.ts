// import { PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { Prisma } from "../../../../generated/prisma/client";
import { PaymentStatus } from "../../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import { ICreatePaymentPayload } from "./payment.interface";

const createPayment = async (
	payload: ICreatePaymentPayload,

) => {
	const {studentId,  invoiceId, amount, method } = payload;

	// 1. Check invoice exists and belongs to the student
	const invoice = await prisma.invoice.findFirst({
		where: {
			id: invoiceId,
			studentId,
		},
	});

	if (!invoice) {
		throw new Error("Invoice not found or does not belong to this student");
	}

	// 2. Validate payment amount
	const paymentAmount = new Prisma.Decimal(amount);

	if (paymentAmount.lte(0)) {
		throw new Error("Payment amount must be greater than 0");
	}

	// 3. Prevent payment greater than invoice amount
	if (paymentAmount.gt(invoice.amount)) {
		throw new Error("Payment amount cannot exceed invoice amount");
	}

	// 4. Create payment
	const payment = await prisma.payment.create({
		data: {
			invoiceId,
			studentId,
			amount: paymentAmount,
			method,

			// Never trust these values from client
			status: PaymentStatus.PENDING,

			verifiedById: null,
			verifiedAt: null,
			paidAt: null,
		},

		include: {
			invoice: true,
			student: true,
		},
	});

	return payment;
};

export const paymentService = {
	createPayment,
};