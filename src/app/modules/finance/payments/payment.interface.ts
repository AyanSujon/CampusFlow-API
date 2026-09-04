import { PaymentMethod } from "../../../../generated/prisma/enums";

export interface ICreatePaymentPayload {
    studentId: string;
	invoiceId: string;
	amount: string | number;
	method: PaymentMethod;
}
