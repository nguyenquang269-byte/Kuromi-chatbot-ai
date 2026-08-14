export default function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  res.status(200).json({
    status: "ok",
    character: "Kuromi",
    models: ["gemini-3.1-flash-lite", "gemini-3.7-flash"],
    capabilities: ["vietnamese_education", "storyteller", "why_explainer", "memory_vault"],
  });
}
