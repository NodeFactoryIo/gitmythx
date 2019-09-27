import * as express from "express";
import GithubHookController from "../Controller/Hooks/GithubHookController";
import githubMiddleware from "../Services/Github/GithubWebhookMiddleware";

const router = express.Router();

router.post("/hook", githubMiddleware, GithubHookController.hook);

export default router;
