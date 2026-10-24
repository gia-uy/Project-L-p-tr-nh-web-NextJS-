const express = require("express");
const controller = require("../controllers/tourController");

const router = express.Router();
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

router.get("/stats", asyncRoute(controller.stats));
router.get("/", asyncRoute(controller.list));
router.post("/", asyncRoute(controller.create));
router.get("/:id", asyncRoute(controller.getById));
router.put("/:id", asyncRoute(controller.update));
router.delete("/:id", asyncRoute(controller.remove));
router.patch("/:id/dat-cho", asyncRoute(controller.book));

module.exports = router;
