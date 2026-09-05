export interface CreatePaymentPayload {
  paymentId: string;
  invoiceId: string;
  studentId: string;

  amount: number;
  currency: string;

  description: string;
}

export interface CreatePaymentResult {
  sessionId: string;
  paymentId?: string;
  checkoutUrl: string;
  gatewayData?: unknown;
}

export interface PaymentGateway {
  createPayment(
    data: CreatePaymentPayload
  ): Promise<CreatePaymentResult>;
}