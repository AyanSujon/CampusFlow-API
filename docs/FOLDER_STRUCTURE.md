# CampusFlow - Folder Structure

### each business module owns its controller, service, repository, validation, routes, types, and Prisma-facing logic.

I would also keep the nested domains (finance/payments, student-academics/grades, etc.) independently modular.



src/
│
├── app.ts
├── server.ts
│
├── config/
│   ├── env.ts
│   └── prisma.ts
│
├── core/
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   ├── not-found.middleware.ts
│   │   └── global-error.middleware.ts
│   │
│   ├── errors/
│   │   ├── AppError.ts
│   │   ├── error-codes.ts
│   │   └── error-handler.ts
│   │
│   ├── response/
│   │   ├── response.ts
│   │   ├── success-response.ts
│   │   └── pagination.ts
│   │
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── request.types.ts
│   │   ├── response.types.ts
│   │   └── pagination.types.ts
│   │
│   ├── constants/
│   │   ├── roles.ts
│   │   ├── permissions.ts
│   │   └── status.ts
│   │
│   └── utils/
│       ├── async-handler.ts
│       ├── pagination.ts
│       ├── id-generator.ts
│       ├── decimal.ts
│       └── date.ts
│
├── modules/
│   │
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.validation.ts
│   │   ├── auth.types.ts
│   │   ├── auth.constants.ts
│   │   └── auth.utils.ts
│   │
│   ├── users/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.repository.ts
│   │   ├── user.routes.ts
│   │   ├── user.validation.ts
│   │   ├── user.types.ts
│   │   └── user.constants.ts
│   │
│   ├── profiles/
│   │   ├── profiles.controller.ts
│   │   ├── profiles.service.ts
│   │   ├── profiles.repository.ts
│   │   ├── profiles.routes.ts
│   │   ├── profiles.validation.ts
│   │   └── profiles.types.ts
│   │
│   ├── organization/
│   │   │
│   │   ├── faculties/
│   │   │   ├── faculty.controller.ts
│   │   │   ├── faculty.service.ts
│   │   │   ├── faculty.repository.ts
│   │   │   ├── faculty.routes.ts
│   │   │   ├── faculty.validation.ts
│   │   │   └── faculty.types.ts
│   │   │
│   │   ├── departments/
│   │   │   ├── department.controller.ts
│   │   │   ├── department.service.ts
│   │   │   ├── department.repository.ts
│   │   │   ├── department.routes.ts
│   │   │   ├── department.validation.ts
│   │   │   └── department.types.ts
│   │   │
│   │   ├── programs/
│   │   │   ├── program.controller.ts
│   │   │   ├── program.service.ts
│   │   │   ├── program.repository.ts
│   │   │   ├── program.routes.ts
│   │   │   ├── program.validation.ts
│   │   │   └── program.types.ts
│   │   │
│   │   └── organization.routes.ts
│   │
│   ├── academic-catalog/
│   │   │
│   │   ├── courses/
│   │   │   ├── course.controller.ts
│   │   │   ├── course.service.ts
│   │   │   ├── course.repository.ts
│   │   │   ├── course.routes.ts
│   │   │   ├── course.validation.ts
│   │   │   └── course.types.ts
│   │   │
│   │   ├── subjects/
│   │   │   ├── subject.controller.ts
│   │   │   ├── subject.service.ts
│   │   │   ├── subject.repository.ts
│   │   │   ├── subject.routes.ts
│   │   │   ├── subject.validation.ts
│   │   │   └── subject.types.ts
│   │   │
│   │   └── academic-catalog.routes.ts
│   │
│   ├── academic-delivery/
│   │   │
│   │   ├── sections/
│   │   │   ├── section.controller.ts
│   │   │   ├── section.service.ts
│   │   │   ├── section.repository.ts
│   │   │   ├── section.routes.ts
│   │   │   ├── section.validation.ts
│   │   │   └── section.types.ts
│   │   │
│   │   ├── class-schedules/
│   │   │   ├── class-schedule.controller.ts
│   │   │   ├── class-schedule.service.ts
│   │   │   ├── class-schedule.repository.ts
│   │   │   ├── class-schedule.routes.ts
│   │   │   ├── class-schedule.validation.ts
│   │   │   └── class-schedule.types.ts
│   │   │
│   │   └── academic-delivery.routes.ts
│   │
│   ├── student-academics/
│   │   │
│   │   ├── enrollments/
│   │   │   ├── enrollment.controller.ts
│   │   │   ├── enrollment.service.ts
│   │   │   ├── enrollment.repository.ts
│   │   │   ├── enrollment.routes.ts
│   │   │   ├── enrollment.validation.ts
│   │   │   └── enrollment.types.ts
│   │   │
│   │   ├── attendance/
│   │   │   ├── attendance.controller.ts
│   │   │   ├── attendance.service.ts
│   │   │   ├── attendance.repository.ts
│   │   │   ├── attendance.routes.ts
│   │   │   ├── attendance.validation.ts
│   │   │   └── attendance.types.ts
│   │   │
│   │   ├── assignments/
│   │   │   ├── assignment.controller.ts
│   │   │   ├── assignment.service.ts
│   │   │   ├── assignment.repository.ts
│   │   │   ├── assignment.routes.ts
│   │   │   ├── assignment.validation.ts
│   │   │   └── assignment.types.ts
│   │   │
│   │   ├── exams/
│   │   │   ├── exam.controller.ts
│   │   │   ├── exam.service.ts
│   │   │   ├── exam.repository.ts
│   │   │   ├── exam.routes.ts
│   │   │   ├── exam.validation.ts
│   │   │   └── exam.types.ts
│   │   │
│   │   ├── grades/
│   │   │   ├── grade.controller.ts
│   │   │   ├── grade.service.ts
│   │   │   ├── grade.repository.ts
│   │   │   ├── grade.routes.ts
│   │   │   ├── grade.validation.ts
│   │   │   └── grade.types.ts
│   │   │
│   │   ├── results/
│   │   │   ├── result.controller.ts
│   │   │   ├── result.service.ts
│   │   │   ├── result.repository.ts
│   │   │   ├── result.routes.ts
│   │   │   ├── result.validation.ts
│   │   │   └── result.types.ts
│   │   │
│   │   └── student-academics.routes.ts
│   │
│   ├── finance/
│   │   │
│   │   ├── invoices/
│   │   │   ├── invoice.controller.ts
│   │   │   ├── invoice.service.ts
│   │   │   ├── invoice.repository.ts
│   │   │   ├── invoice.routes.ts
│   │   │   ├── invoice.validation.ts
│   │   │   └── invoice.types.ts
│   │   │
│   │   ├── payments/
│   │   │   ├── payment.controller.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── payment.repository.ts
│   │   │   ├── payment.routes.ts
│   │   │   ├── payment.validation.ts
│   │   │   ├── payment.types.ts
│   │   │   │
│   │   │   ├── gateways/
│   │   │   │   ├── payment-gateway.interface.ts
│   │   │   │   └── stripe/
│   │   │   │       ├── stripe.service.ts
│   │   │   │       ├── stripe.webhook.ts
│   │   │   │       └── stripe.types.ts
│   │   │   │
│   │   │   └── payment.utils.ts
│   │   │
│   │   ├── scholarships/
│   │   │   ├── scholarship.controller.ts
│   │   │   ├── scholarship.service.ts
│   │   │   ├── scholarship.repository.ts
│   │   │   ├── scholarship.routes.ts
│   │   │   ├── scholarship.validation.ts
│   │   │   └── scholarship.types.ts
│   │   │
│   │   ├── financial-transactions/
│   │   │   ├── financial-transaction.controller.ts
│   │   │   ├── financial-transaction.service.ts
│   │   │   ├── financial-transaction.repository.ts
│   │   │   ├── financial-transaction.routes.ts
│   │   │   └── financial-transaction.types.ts
│   │   │
│   │   └── finance.routes.ts
│   │
│   ├── communication/
│   │   │
│   │   ├── notices/
│   │   │   ├── notice.controller.ts
│   │   │   ├── notice.service.ts
│   │   │   ├── notice.repository.ts
│   │   │   ├── notice.routes.ts
│   │   │   ├── notice.validation.ts
│   │   │   └── notice.types.ts
│   │   │
│   │   ├── events/
│   │   │   ├── event.controller.ts
│   │   │   ├── event.service.ts
│   │   │   ├── event.repository.ts
│   │   │   ├── event.routes.ts
│   │   │   ├── event.validation.ts
│   │   │   └── event.types.ts
│   │   │
│   │   └── communication.routes.ts
│   │
│   └── system/
│       │
│       ├── audit-logs/
│       │   ├── audit-log.controller.ts
│       │   ├── audit-log.service.ts
│       │   ├── audit-log.repository.ts
│       │   ├── audit-log.routes.ts
│       │   └── audit-log.types.ts
│       │
│       ├── system-settings/
│       │   ├── system-setting.controller.ts
│       │   ├── system-setting.service.ts
│       │   ├── system-setting.repository.ts
│       │   ├── system-setting.routes.ts
│       │   ├── system-setting.validation.ts
│       │   └── system-setting.types.ts
│       │
│       └── system.routes.ts
│
├── routes/
│   └── index.ts
│
└── types/
    └── express.d.ts