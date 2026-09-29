import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { usersController } from "./user.controller";



const router= Router();


router.get("/all",
    auth(Role.SUPER_ADMIN),
    usersController.getAllUsersBySuperAdmin
     );


































export const UsersRoutes = router; 