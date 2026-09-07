import { Router } from "express";
import { programsController } from "./program.controller";


const router = Router();


router.post("/create", programsController.createProgram)



















export const programsRoutes = router; 



