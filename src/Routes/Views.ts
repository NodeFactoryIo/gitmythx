import * as express from "express";
import config from "../Config/Config";
import CheckRunReport from "../Models/CheckRunReport";
import User from "../Models/User";
import {GithubUserService} from "../Services/Github/GithubUserService";
import logger from "../Services/Logger";

const router = express.Router();

router.get("/setup/:checkRunId*?", async (req, res) => {
    if (!req.githubUser) {
        return res.redirect(
            `https://github.com/login/oauth/authorize?client_id=${config.github.client.id}`,
        );
    }
    let mythxUser = await User.findOne({ where: { id: req.githubUser.id.toString() }});
    if (!mythxUser) {
        mythxUser = {
            accessToken: "Undefined",
            refreshToken: "Undefined",
        } as any;
    }
    res.render("setup", {
        githubUser: req.githubUser,
        mythxUser,
        checkRunUrl: req.params.checkRunId ? `/github/check/status/${req.params.checkRunId}` : "",
    });
});

router.post("/mythx/login", async (req, res) => {
    const accessToken = req.body.jwt.access;
    const refreshToken = req.body.jwt.refresh;
    if (!accessToken || !refreshToken) {
        logger.error("JWT tokens not provided in request.");
        res.status(400).end();
    }
    const user = await User.findOne({ where: { id: req.githubUser.id.toString() }});
    try {
        user ?
            await user.update({ accessToken, refreshToken })
            : await User.create(
            { id: req.githubUser.id.toString(), accessToken, refreshToken },
            );
    } catch (e) {
        logger.error(e);
        return res.status(500).end();
    }
    return res.status(200).end();
});

router.get("/oauth/github", async (req, res) => {
    const accessToken = await new GithubUserService().getUserAccessCode(req.query.code);
    res.cookie("githubAuth", accessToken, {httpOnly: true, maxAge: 900000});
    res.redirect("/setup");
});

router.get("/github/check/status/:checkRunId", async (req, res) => {
    const reports = await CheckRunReport.all({ where: {checkRunId: req.params.checkRunId}});
    const analysis = reports.map((report) => {
        return JSON.parse(report.report);
    });
    res.render("status", {
        analysis,
        setupUrl: `${config.app.hostname}/setup/${req.params.checkRunId}`,
    });
});

export default router;
