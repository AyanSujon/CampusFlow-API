import cookieParser from "cookie-parser";
import cors from "cors";
import crypto from "crypto";
import express, {
	type Application,
	NextFunction,
	type Request,
	type Response,
} from "express";
import httpStatus from "http-status";
import config from "./app/config";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { AuthRoutes } from "./app/modules/auth/auth.route";
import { redisClient } from "./app/lib/redis";
import { FinanceRoutes } from "./app/modules/finance/invoices/invoice.routes";
import { profileRoutes } from "./app/modules/profiles/profiles.routes";


const app: Application = express();

app.use(
	cors({
		origin: config.frontend_url,
		credentials: true,
	}),
);

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", AuthRoutes);

app.use("/api/v1/profiles", profileRoutes);

app.use("/api/v1/finance", FinanceRoutes);







app.get("/test", async (req: Request, res: Response, next : NextFunction) => {

	try {

		// 100000 > 999999 > 1000000
			const otp = crypto.randomInt(100000, 1000000) // 1, 2, 3, 4, 5, 6,7,8 ,9, 10 => X-11
		
			// await redisClient.set("forgot-password-otp:patient1@gmail.com", otp, {
			// 	expiration : {
			// 		type : "EX",
			// 		value : 60
			// 	}
			// })
			

		


		res.status(httpStatus.OK).json({
			success: true,
			message: "Welcome to PH Healthcare System Backend",
			data : otp
		});
	} catch (error) {
		console.log(error);
		next(error)
	}
})

// Basic route / Health Check
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

app.use(globalErrorHandler);
app.use(notFound);

export default app;
