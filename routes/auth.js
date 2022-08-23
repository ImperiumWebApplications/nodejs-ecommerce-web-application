const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

router.get("/login", authController.getLogin);
router.get("/signup", authController.getSignup);
router.get("/reset", authController.getReset);
router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);
router.post("/reset", authController.postReset);
router.post("/signup", authController.postSignUp);
router.post("/login", authController.postLogin);
router.post("/logout", authController.postLogout);

module.exports = router;
