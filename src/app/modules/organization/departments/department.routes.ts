import { Router } from "express";
import { auth } from "../../../middleware/checkAuth";
import { Role } from "../../../../generated/prisma/enums";
import { departmentsController } from "./department.controller";



const router = Router();



router.post("/create",
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    // validateRequest(facultyValidation.createFacultyZodSchema),
    departmentsController.createDepartment
     );




export const departmentsRoutes = router;



