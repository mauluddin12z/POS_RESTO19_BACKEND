import express from "express";
import {
   createSaleDetail,
   deleteSaleDetail,
   getSaleDetails,
   getSaleDetailById,
   updateSaleDetail,
} from "../controllers/saleDetailsController.js";

const router = express.Router();

router.get("/sale-details", getSaleDetails);
router.get("/sale-detail/:saleDetailId", getSaleDetailById);
router.post("/sale-detail", createSaleDetail);
router.patch("/sale-detail/:saleDetailId", updateSaleDetail);
router.delete("/sale-detail/:saleDetailId", deleteSaleDetail);

export default router;
