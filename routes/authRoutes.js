import express from "express";
import {
  forgotController,
  loginControllers,
  registerController,
  resetPassword,
  testController
} from "../controllers/authControllers.js";
import { isAdmin, requireSignIn } from '../middlewares/authMiddlewares.js'
// router object
const router = express.Router();
// routing
// register || method post
router.post("/register", registerController);

//login ||post
router.post("/login", loginControllers);

//test routes
router.get("/test",requireSignIn,isAdmin, testController);
//forgot pass | post
router.post("/forgot-password", forgotController);
router.post("/reset-password/:id/:token", resetPassword);
// router.post("/forgot-password/:id/:token", forgotControllerEmail);
// protect routes auth
router.get("/user-auth",requireSignIn,(req,res)=>{
res.status(200).send({
  ok:true
})
})
// protect admin routes auth
router.get("/admin-auth",requireSignIn,isAdmin,(req,res)=>{
res.status(200).send({
  ok:true
})
})

export default router;
