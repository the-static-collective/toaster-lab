/**
 * Toaster Lab Express Server
 * Handles API endpoints for GenerationPlan proposals, mutations, breeding, and coverage
 * Mounts Vite middleware for development and serves static build in production on port 3000
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { generateProposals } from "./src/server/geminiProposer";
import {
  rerollAxis,
  breedPlans,
  computeCreativeCoverage,
  DEFAULT_GARMENT_CONSTRAINT,
} from "./src/lib/toasterEngine";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "Toaster Lab Workbench" });
  });

  // Generate 3 plan proposals
  app.post("/api/toaster/analyze-and-propose", async (req, res) => {
    try {
      const proposals = await generateProposals(req.body);
      res.json({ success: true, proposals });
    } catch (error: any) {
      console.error("Error generating proposals:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to generate proposals" });
    }
  });

  // Reroll single axis
  app.post("/api/toaster/reroll-axis", (req, res) => {
    try {
      const { plan, axisKey, seed, garmentConstraint } = req.body;
      const constraints = garmentConstraint || DEFAULT_GARMENT_CONSTRAINT;
      const { newPlan, mutationReason } = rerollAxis(plan, axisKey, seed, constraints);
      res.json({ success: true, newPlan, mutationReason });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Breed two plans
  app.post("/api/toaster/breed", (req, res) => {
    try {
      const { planA, planB, blend, seed } = req.body;
      const blendedPlan = breedPlans(planA, planB, blend ?? 0.5, seed ?? 42);
      res.json({ success: true, blendedPlan });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Calculate coverage
  app.post("/api/toaster/coverage", (req, res) => {
    try {
      const { plans, receipts } = req.body;
      const coverage = computeCreativeCoverage(plans || [], receipts || []);
      res.json({ success: true, coverage });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite middleware in dev vs static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Toaster Lab] Workbench server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal server startup error:", err);
});
