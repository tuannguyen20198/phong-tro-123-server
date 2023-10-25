import express from "express";
import * as inserController from "../controller/insert";
const router = express.Router();
router.post("/", inserController.insert);

export default router;
