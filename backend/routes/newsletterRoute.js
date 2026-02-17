import express from "express";
import { subscribeNewsletter, getNewsletterSubscribers, unsubscribeNewsletter } from "../controllers/newsletterController.js";
import adminAuth from "../middleware/adminAuth.js";

const newsletterRouter = express.Router();

// Public route - anyone can subscribe
newsletterRouter.post("/subscribe", subscribeNewsletter);

// Admin route - get all subscribers
newsletterRouter.get("/subscribers", adminAuth, getNewsletterSubscribers);

// Public route - unsubscribe
newsletterRouter.post("/unsubscribe", unsubscribeNewsletter);

export default newsletterRouter;
