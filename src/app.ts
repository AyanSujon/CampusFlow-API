import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import httpStatus from "http-status";
import config from "./app/config";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { AuthRoutes } from "./app/modules/auth/auth.route";
import { profileRoutes } from "./app/modules/profiles/profiles.routes";
import { financeRoutes } from "./app/modules/finance/finance.routes";
import { globalRateLimiter } from "./app/middleware/rateLimiter";

const app: Application = express();

// 1. Security headers
app.use(helmet());

// 2. CORS
app.use(
	cors({
		origin: config.frontend_url,
		credentials: true,
	}),
);

// 3. Rate limiting
app.use(globalRateLimiter);

// 4. Stripe webhook - BEFORE express.json()
app.use(
	"/api/v1/finance/payments/webhook",
	express.raw({
		type: "application/json",
	}),
);

// 5. Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 6. Cookies
app.use(cookieParser());

// 7. Routes
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/profiles", profileRoutes);
app.use("/api/v1/finance", financeRoutes);

// 8. Health check
app.get("/", async (req: Request, res: Response) => {
	res.status(httpStatus.OK).json({
		success: true,
		message: "Welcome to CampusFlow - University Management System",
		data: {
			name: "CampusFlow API",
			description: "University Management System Backend API",
			version: "1.0.0",
			status: "healthy",
			environment: config.node_env,
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
		},
	});
});

// 9. 404 not found handler
app.use(notFound);

// 10. Global error handler
app.use(globalErrorHandler);

export default app;