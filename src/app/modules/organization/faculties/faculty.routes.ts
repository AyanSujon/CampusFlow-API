import { Router } from "express";
import { Role } from "../../../../generated/prisma/browser";
import { auth } from "../../../middleware/checkAuth";
import { facultyController } from "./faculty.controller";


const router = Router();


router.post("/create",
    auth(Role.SUPER_ADMIN),
    // validateRequest(facultyValidation.createFacultyZodSchema),
    facultyController.createFaculty
     );







export const facultiesRoutes = router;