import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { AnalyticsController } from "./analytics.controller";





const router = Router();



router.get(
    "/super-admin-analytics",
    auth(Role.SUPER_ADMIN),
    AnalyticsController.getSuperAdminAnalytics,
);











export const AnalyticsRoutes = router;
