import { Router } from "express";
import { coursesRoutes } from "./courses/course.routes";
import { subjectsRoutes } from "./subjects/subject.routes";





const router = Router();

router.use("/subjects", subjectsRoutes);
router.use("/courses", coursesRoutes);
// router.use("/course-instructors", courseInstructorsRoutes);





export const academicCatalogRoutes = router;