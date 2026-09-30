

import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { auth } from "../../../middleware/checkAuth";
import { instructorsProfileController } from "./instructors.controller";




const router= Router();



router.get("/all",  auth(Role.SUPER_ADMIN),
    instructorsProfileController.getAllInstructorsProfile
);







export const instructorProfileRoutes = router;