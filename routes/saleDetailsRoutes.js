import express from "express";
import {
   createSaleDetail,
   deleteSaleDetail,
   getSaleDetails,
   getSaleDetailById,
   updateSaleDetail,
} from "../controllers/saleDetailsController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/sale-details",verifyToken, getSaleDetails);
router.get("/sale-detail/:saleDetailId",verifyToken, getSaleDetailById);
router.post("/sale-detail",verifyToken, createSaleDetail);
router.patch("/sale-detail/:saleDetailId",verifyToken, updateSaleDetail);
router.delete("/sale-detail/:saleDetailId",verifyToken, deleteSaleDetail);

export default router;
