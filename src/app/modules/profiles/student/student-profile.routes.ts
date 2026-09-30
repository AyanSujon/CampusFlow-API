import { Router } from "express";
import { studentProfileController } from "./student-profile.controller";
import { Role } from "../../../../generated/prisma/enums";
import { auth } from "../../../middleware/checkAuth";




const router= Router();



router.get("/all",  auth(Role.STUDENT, Role.SUPER_ADMIN),
    studentProfileController.getAllStudentProfile
);



router.post("/create-profile",
    auth(Role.STUDENT),
    // validateRequest(studentProfileValidation.createStudentProfileZodSchema),
    studentProfileController.createStudentProfile
     );










export const studentProfileRoutes = router;