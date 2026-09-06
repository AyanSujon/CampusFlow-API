import { Router } from "express";
import { facultiesRoutes } from "./faculties/faculty.routes";




const router = Router();

router.use("/faculties", facultiesRoutes);
// router.use("/departments", departmentsRoutes);
// router.use("/programs", programsRoutes);





export const organizationRoutes = router;