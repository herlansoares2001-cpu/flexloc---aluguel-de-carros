import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { validateRental } from "./src/utils/rentalValidation";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/validate-reservation", (req, res) => {
    const { plan, dateStart, dateEnd, timeStart, timeEnd } = req.body;
    
    const result = validateRental({
      plan,
      dateStart,
      dateEnd,
      timeStart,
      timeEnd
    });

    if (!result.isValid) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
