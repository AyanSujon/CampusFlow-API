/** biome-ignore-all lint/style/useConst: <explanation> */
import bcrypt from "bcryptjs";
import crypto from "crypto";
import ejs from "ejs";
import type { TokenPayload } from "google-auth-library";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import httpStatus from "http-status";
import path from "path";
import {
	AuthProvider,
	Role,
} from "../../../generated/prisma/enums";
import config from "../../config";
import { googleClient } from "../../lib/googleAuth";
import { transporter } from "../../lib/nodemailer";
import { prisma } from "../../lib/prisma";
import { redisClient } from "../../lib/redis";
import { jwtUtils } from "../../utils/jwt";
import type {
	IForgotPasswordPayload,
	IGoogleLoginPayload,
	ILoginUserPayload,
	IRegisterStudentPayload,
	IRequestUser,
	IResetPasswordPayload,
	IVerifyEmailPayload,
} from "./auth.interface";
import { generateStudentId } from "../../utils/idGenerator";
import { Prisma } from "../../../generated/prisma/browser";
import { AppError } from "../../utils/AppError";


// const registerStudent = async (payload: IRegisterStudentPayload) => {
// 	const {
// 		name,
// 		password,
// 		email,
// 		studentProfile: studentProfileData,
// 	} = payload;

// 	// Check existing user
// 	const isUserExists = await prisma.user.findUnique({
// 		where: { email },
// 	});

// 	if (isUserExists) {
// 		throw new Error("User with this email already exists");
// 	}

// 	// Hash password
// 	const hashedPassword = await bcrypt.hash(password, 8);

// 	/* ============================================================
// 	   STUDENT ID Generate Logic
	   
// 	   Format: STU-YYYY-DEPT-XXXX

// 	   Example:
// 	   STU-2026-CSE-0001
// 	   STU-2026-CSE-0002
// 	   STU-2026-EEE-0001
// 	============================================================ */

// 	// Generate only when student profile is provided
// 	const studentId = studentProfileData
// 		? generateStudentId("CSE", 1, 2026)
// 		: undefined;

// 	// Prepare user data
// 	const userData: Prisma.UserCreateInput = {
// 		name,
// 		email,
// 		password: hashedPassword,
// 		role: Role.STUDENT,

// 		// Student profile is completely optional
// 		...(studentProfileData && {
// 			studentProfile: {
// 				create: {
// 					...studentProfileData,
// 					studentId: studentId!,
// 				},
// 			},
// 		}),
// 	};

// 	const createdUser = await prisma.user.create({
// 		data: userData,

// 		omit: {
// 			password: true,
// 		},

// 		include: {
// 			studentProfile: true,
// 		},
// 	});

// 	const { studentProfile, ...user } = createdUser;

// 	// JWT Payload
// 	const jwtPayload = {
// 		id: user.id,
// 		email: user.email,
// 		name: user.name,
// 		role: user.role,
		
// 	};

// 	// Access Token
// 	const accessToken = jwtUtils.createToken(
// 		jwtPayload,
// 		config.jwt_access_secret,
// 		config.jwt_access_expires_in as SignOptions,
// 	);

// 	// Refresh Token
// 	const refreshToken = jwtUtils.createToken(
// 		jwtPayload,
// 		config.jwt_refresh_secret,
// 		config.jwt_refresh_expires_in as SignOptions,
// 	);

// 	return {
// 		user,
// 		studentProfile,
// 		accessToken,
// 		refreshToken,
// 	};
// };






const registerStudent = async (payload: IRegisterStudentPayload) => {
  	const {
		name,
		password,
		studentProfile: studentProfileData,
	} = payload;


  const email = payload.email.trim().toLowerCase();

  const isUserExists = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExists) {
    throw new AppError(
      httpStatus.CONFLICT,
      "User with this email already exists",
    );
  }

  const hashedPassword = await bcrypt.hash(password, 8);

  const expirationSeconds = 5 * 60;

  const otpKey = `student-registration-otp:${email}`;
  const otpValue = crypto.randomInt(100000, 1000000).toString();

  if (config.node_env === "development") {
    console.log(`[dev] OTP ${email} : ${otpValue}`);
  }

  await redisClient.set(otpKey, otpValue, {
    expiration: {
      type: "EX",
      value: expirationSeconds,
    },
  });

  const studentRegistrationKey = `student-registration-data:${email}`;
  const redisUserDataPayload = {
    name,
    email,
    password: hashedPassword,
	studentProfileData
  };

  await redisClient.set(
    studentRegistrationKey,
    JSON.stringify(redisUserDataPayload),
    {
      expiration: {
        type: "EX",
        value: expirationSeconds,
      },
    },
  );

  const tempatePath = path.join(
    process.cwd(),
    "src/app/templates/registration-user-otp.ejs",
  );

  const templateData = {
    name,
    email,
    otp: otpValue,
    expirationMinutes: expirationSeconds / 60,
  };

  const html = await ejs.renderFile(tempatePath, templateData);

  await transporter.sendMail({
    from: config.email_sender,
    to: email,
    subject: "Email Verification",
    // text : `Your OTP is ${otp}`
    // html: `<h1>Your OTP is ${otp}</h1>`
    html,
  });
};










const verifyStudentEmail = async (payload: IVerifyEmailPayload) => {
  const otp = payload.otp;
  const email = payload.email.trim().toLowerCase();

  const isUserExist = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExist?.isActive === false) {
    throw new AppError(httpStatus.FORBIDDEN, "User is Blocked");
  }

  if (isUserExist?.emailVerified) {
    throw new AppError(httpStatus.CONFLICT, "Email ALready Verified");
  }

  if (isUserExist?.isDeleted || isUserExist?.isDeleted === true) {
    throw new AppError(httpStatus.FORBIDDEN, "User is Deleted");
  }

  const otpKey = `student-registration-otp:${email}`;

  const redisOtp = await redisClient.get(otpKey);

  if (!redisOtp) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }

  if (redisOtp !== otp) {
    throw new AppError(httpStatus.BAD_REQUEST, "OTP Does Not Match");
  }

  await redisClient.del(otpKey);

  const studentRegistrationKey = `student-registration-data:${email}`;

  const redisStudentData = await redisClient.get(studentRegistrationKey);

  if (!redisStudentData) {
    throw new AppError(httpStatus.NOT_FOUND, "Student Doesnt Exist");
  }

  const studentPayload: IRegisterStudentPayload = JSON.parse(redisStudentData);

  const createdUser = await prisma.user.create({
    data: {
      name: studentPayload.name,
      email: studentPayload.email,
      password: studentPayload.password,
      role: Role.STUDENT,
      isActive: true,
      emailVerified: true,
      studentProfile: {
        create: {
          name: studentPayload.name,
          email: studentPayload.email,
          
        },
      },
    },
    omit: { password: true },
    include: { studentProfile: true },
  });

  await redisClient.del(studentRegistrationKey);

  const tempatePath = path.join(
    process.cwd(),
    "src/app/templates/student-welcome-email.ejs",
  );

  const templateData = {
    name: createdUser.name,
  };

  const html = await ejs.renderFile(tempatePath, templateData);

  await transporter.sendMail({
    from: config.email_sender,
    to: email,
    subject: "Welcome to CampusFlow - University Management System",
    // text : `Your OTP is ${otp}`
    // html: `<h1>Your OTP is ${otp}</h1>`
    html,
  });

  const { studentProfile, ...user } = createdUser;
  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    user,
    studentProfile,
    accessToken,
    refreshToken,
  };
};









const resendOTP = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();

  const expirationSeconds = 5 * 60;

  const studentRegistrationKey = `student-registration-data:${normalizedEmail}`;
  const otpKey = `student-registration-otp:${normalizedEmail}`;

  // Check if registration data still exists
  const registrationData = await redisClient.get(studentRegistrationKey);

  if (!registrationData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Registration session has expired. Please register again.",
    );
  }

  // Generate a new OTP
  const otpValue = crypto.randomInt(100000, 1000000).toString();

  if (config.node_env === "development") {
    console.log(`[dev] Resend OTP ${normalizedEmail} : ${otpValue}`);
  }

  // Store new OTP and reset expiration to 5 minutes
  await redisClient.set(otpKey, otpValue, {
    expiration: {
      type: "EX",
      value: expirationSeconds,
    },
  });

  // Get user data for email template
  const userData = JSON.parse(registrationData);

  const templatePath = path.join(
    process.cwd(),
    "src/app/templates/registration-user-otp.ejs",
  );

  const templateData = {
    name: userData.name,
    email: normalizedEmail,
    otp: otpValue,
    expirationMinutes: expirationSeconds / 60,
  };

  const html = await ejs.renderFile(templatePath, templateData);

  await transporter.sendMail({
    from: config.email_sender,
    to: normalizedEmail,
    subject: "Email Verification - New OTP",
    html,
  });
};











const loginUser = async (payload: ILoginUserPayload) => {
	const { password } = payload;
	const email = payload.email.trim().toLowerCase();

	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (!user) {
		throw new Error("User not found");
	}



	if (user.isDeleted || user.isActive === false) {
		throw new Error("User is inactive");
	}

	if (user.password === null && user.googleId !== null) {
		throw new Error(
			"User Already Has Account Registered With Google. Try To Login With Google.",
		);
	}

	const isPasswordMatched = await bcrypt.compare(
		password,
		user.password as string,
	);

	if (!isPasswordMatched) {
		throw new Error("Invalid credentials");
	}

	const jwtPayload = {
		id: user.id,
		email: user.email,
		name: user.name,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

const getMe = async (user: IRequestUser) => {
	const isUserExists = await prisma.user.findUnique({
		where: {
			id: user.id,
		},
		include: {
			studentProfile: true,
		},
		omit: {
			password: true,
		},
	});

	if (!isUserExists) {
		throw new Error("User not found");
	}

	return isUserExists;
};

const refreshToken = async (token: string) => {
	const verifiedRefreshToken = jwtUtils.verifyToken(
		token,
		config.jwt_refresh_secret,
	);

	if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
		throw new Error(
			config.node_env === "development"
				? verifiedRefreshToken.error
				: "Invalid refresh token",
		);
	}

	const data = verifiedRefreshToken.data as JwtPayload;

	const user = await prisma.user.findUnique({
		where: { id: data.userId },
	});

	if (!user || user.isDeleted || user.isActive !== true) {
		throw new Error("User is inactive or not found");
	}

	const jwtPayload = {
		id: user.id,
		email: user.email,
		name: user.name,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

const googleLogin = async (payload: IGoogleLoginPayload) => {
	let googleIdTokenPayload: TokenPayload | null | undefined = null;
	try {
		const ticket = await googleClient.verifyIdToken({
			idToken: payload.idToken,
			audience: config.google_client_id,
		});

		googleIdTokenPayload = ticket.getPayload();
	} catch (error) {
		console.log("Google ID Token Verification Failed", error);
		throw new Error("Invalid Or Expired Google Id Token");
	}

	if (!googleIdTokenPayload) {
		throw new Error("Invalid Or Expired Google Id Token");
	}

	if (!googleIdTokenPayload.email) {
		throw new Error("Google Email Not Found");
	}
	if (!googleIdTokenPayload.name) {
		throw new Error("Google Email User Name Not Found");
	}

	const ifStudentExistWithGoogleAuth = await prisma.user.findUnique({
		where: {
			email: googleIdTokenPayload.email,
			role: Role.STUDENT,
			googleId: googleIdTokenPayload.sub,
		},
	});

	let user = ifStudentExistWithGoogleAuth;

	if (!ifStudentExistWithGoogleAuth) {
		const ifStudentExistWithCredentials = await prisma.user.findUnique({
			where: {
				email: googleIdTokenPayload.email,
				role: Role.STUDENT,
				authProvider: AuthProvider.CREDENTIAL,
			},
		});

		if (ifStudentExistWithCredentials) {
			if (!ifStudentExistWithCredentials.emailVerified) {
				throw new Error("Email Not Verified");
			}

			if (ifStudentExistWithCredentials.isActive === false) {
				throw new Error("User Is Blocked");
			}

			if (
				ifStudentExistWithCredentials.isDeleted
			) {
				throw new Error("User Is Deleted");
			}

			user = await prisma.user.update({
				where: {
					id: ifStudentExistWithCredentials.id,
				},

				data: {
					googleId: googleIdTokenPayload.sub,
				},
			});
		} else {
			// Google Register
			user = await prisma.user.create({
				data: {
					name: googleIdTokenPayload.name,
					email: googleIdTokenPayload.email,
					role: Role.STUDENT,
					googleId: googleIdTokenPayload.sub,
					authProvider: AuthProvider.GOOGLE,
					emailVerified: true,
					studentProfile: {
						create:{
							name: googleIdTokenPayload.name,
							email: googleIdTokenPayload.email,
						}
					}
				},
			});
		}
	}

	if (!user) {
		throw new Error("User Not Found");
	}

	if (user.isActive === false) {
		throw new Error("User Is Blocked");
	}

	if (user.isDeleted) {
		throw new Error("User Is Deleted");
	}

	const jwtPayload = {
		id: user.id,
		email: user.email,
		name: user.name,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

const forgotPassword = async (payload : IForgotPasswordPayload) => {
	const {email} = payload;

	const isUserExist = await prisma.user.findUnique({
		where : {
			email
		}
	});

	if(!isUserExist){
		throw new Error("User Does Not Exist!")
	};

	if(isUserExist.isActive === false){
		throw new Error("User is Blocked")
	}

	if(!isUserExist.emailVerified){
		throw new Error("User Not Verified")
	}

	if(isUserExist.isDeleted ){
		throw new Error("User is Deleted")
	}

	if(isUserExist.googleId && isUserExist.authProvider === "GOOGLE"){
		throw new Error("User Has Account With Google")
	}

	const otp = crypto.randomInt(100000, 1000000).toString();

	const key = `forgor-password-otp:${isUserExist.email}`

	const expirationSeconds = 5 * 60

	await redisClient.set(key, otp, {
		expiration : {
			type : "EX",
			value : expirationSeconds
		}
	})

	const tempatePath = path.join(process.cwd(), "src/app/templates/forgot-password.ejs")

	const templateData = {
		name: isUserExist.name,
		otp,
		expirationMinutes: expirationSeconds / 60

	}

	const html = await ejs.renderFile(tempatePath, templateData)

	await transporter.sendMail({
		from : config.email_sender,
		to : isUserExist.email,
		subject : "Forgot Password",
		// text : `Your OTP is ${otp}`
		// html: `<h1>Your OTP is ${otp}</h1>`
		html
	})
}

const resetPassword = async (payload : IResetPasswordPayload) => {
	const { email, otp, newPassword } = payload;

	const isUserExist = await prisma.user.findUnique({
		where: {
			email
		}
	});

	if (!isUserExist) {
		throw new Error("User Does Not Exist!")
	};

	if (isUserExist.isActive === false) {
		throw new Error("User is Blocked")
	}

	if (!isUserExist.emailVerified) {
		throw new Error("User Not Verified")
	}

	if (isUserExist.isDeleted) {
		throw new Error("User is Deleted")
	}

	if (isUserExist.googleId && isUserExist.authProvider === "GOOGLE") {
		throw new Error("User Has Account With Google")
	}

	const key = `forgor-password-otp:${isUserExist.email}`

	const redisOtp = await redisClient.get(key)

	if(!redisOtp){
		throw new Error("Invalid OTP")
	}

	if(redisOtp !== otp){
		throw new Error("OTP Does Not Match")
	}

	const hashedNewPassword = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));

	await prisma.user.update({
		where : {
			email : isUserExist.email
		},
		data : {
			password : hashedNewPassword
		}
	});

	await redisClient.del([key]);

	const tempatePath = path.join(process.cwd(), "src/app/templates/reset-password-success.ejs");

	const templateData = {
		name: isUserExist.name
	}

	const html = await ejs.renderFile(tempatePath, templateData )


	await transporter.sendMail({
		from: config.email_sender,
		to: isUserExist.email,
		subject: "Password Changed",
		// text : `Your OTP is ${otp}`
		// html: `<h1>Your Password Is Changed</h1>`
		html
	})
}

export const AuthService = {
	registerStudent,
	verifyStudentEmail,
	resendOTP,
	loginUser,
	getMe,
	refreshToken,
	googleLogin,
	forgotPassword,
	resetPassword
};
