import express from "express";
import {
   getSales,
   getSaleById,
   createSale,
   updateSale,
   deleteSale,
} from "../controllers/salesController.js";

const router = express.Router();

router.get("/sales", getSales);
router.get("/sale/:saleId", getSaleById);
router.post("/sale", createSale);
router.patch("/sale/:saleId", updateSale);
router.delete("/sale/:saleId", deleteSale);

export default router;
