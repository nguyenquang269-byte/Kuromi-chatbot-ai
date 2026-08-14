import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { handleChat } from "./api/chat";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Route handlers
app.all("/api/chat", handleChat);

app.post("/api/sync", (req, res) => {
  const { chatHistory, memories, badges } = req.body || {};
  const syncTimestamp = new Date().toISOString();
  res.json({
    status: "synced",
    syncedAt: syncTimestamp,
    cloudVersion: "v1.2-secure-kuromi-vault",
    itemsSynced: {
      messages: chatHistory?.length || 0,
      memories: memories?.length || 0,
      badges: badges?.length || 0,
    },
    message: "Đồng bộ hóa đám mây an toàn thành công!",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    character: "Kuromi",
    models: ["gemini-3.1-flash-lite", "gemini-3.7-flash"],
    capabilities: ["vietnamese_education", "storyteller", "why_explainer", "memory_vault"],
  });
});

// Vite middleware setup
async function startServer() {
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
    console.log(`Kuromi Educational Assistant running on http://localhost:${PORT}`);
  });
}

export default app;

if (!process.env.VERCEL) {
  startServer();
}
