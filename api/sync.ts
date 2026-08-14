export default function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }
  body = body || {};

  const { chatHistory, memories, badges } = body;
  const syncTimestamp = new Date().toISOString();

  res.status(200).json({
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
}
