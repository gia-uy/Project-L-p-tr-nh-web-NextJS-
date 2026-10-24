const express = require("express");
const controller = require("../controllers/diemDenController");

const router = express.Router();
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

router.get("/", asyncRoute(controller.list));
router.post("/", asyncRoute(controller.create));
router.put("/:id", asyncRoute(controller.update));
router.delete("/:id", asyncRoute(controller.remove));

module.exports = router;
