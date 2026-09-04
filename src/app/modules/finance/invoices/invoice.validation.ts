import { z } from "zod";

const moneySchema = z
	.string({
		error: "Amount is required",
	})
	.regex(
		/^\d+(\.\d{1,2})?$/,
		"Amount must be a valid monetary value with maximum 2 decimal places",
	)
	.refine(
		(value) => Number(value) > 0,
		"Amount must be greater than 0",
	);

const createInvoiceZodSchema = z.object({
	body: z.object({
		studentId: z
			.string({
				error: "Student ID is required",
			})
			.uuid("Invalid student ID"),

		description: z
			.string()
			.trim()
			.max(
				500,
				"Description cannot exceed 500 characters",
			)
			.optional(),

		amount: moneySchema,

		dueDate: z
			.string({
				error: "Due date is required",
			})
			.datetime({
				message: "Due date must be a valid ISO datetime",
			}),
	}),
});

const updateInvoiceZodSchema = z.object({
	body: z
		.object({
			description: z
				.string()
				.trim()
				.max(
					500,
					"Description cannot exceed 500 characters",
				)
				.optional(),

			amount: moneySchema.optional(),

			dueDate: z
				.string()
				.datetime({
					message: "Due date must be a valid ISO datetime",
				})
				.optional(),
		})
		.refine(
			(data) => Object.keys(data).length > 0,
			"At least one field is required",
		),
});

export const InvoiceValidation = {
	createInvoiceZodSchema,
	updateInvoiceZodSchema,
};