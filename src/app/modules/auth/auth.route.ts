import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { AuthController } from "./auth.controller";
import { UserValidation } from "./auth.validation";

const router = Router();



router.post("/register",
	validateRequest(UserValidation.StudentRegistrationZodSchema),
	 AuthController.registerStudent);

router.post(
  "/verify-email",
  validateRequest(UserValidation.studentEmailVerifyZodSchema),
  AuthController.verifyStudentEmail,
);
router.post(
  "/resend-otp",
  validateRequest(UserValidation.resendOTPZodSchema),
  AuthController.resendOTP,
);

router.post("/login",
	validateRequest(UserValidation.LoginZodSchema),
	 AuthController.loginUser);
router.get(
	"/me",
	auth(Role.SUPER_ADMIN, Role.ADMIN, Role.DEPARTMENT_HEAD, Role.INSTRUCTOR, Role.STUDENT, Role.ACCOUNTANT ),
	// validateRequest
	AuthController.getMe,
);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/google", AuthController.googleLogin);
router.post("/forgot-password",
	validateRequest(UserValidation.ForgotPasswordZodSchema),
	 AuthController.forgotPassword);
router.post("/reset-password",
	validateRequest(UserValidation.ResetPasswordZodSchema),
	 AuthController.resetPassword);


router.post("/logout",
	 AuthController.logout);



export const AuthRoutes = router;
