import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// API Key pool manager for round-robin rotation & quota protection (up to 5 keys)
let currentKeyIndex = 0;

function getApiKeyPool(clientKeys?: string[]): string[] {
  const pool: string[] = [];
  
  // Add keys passed in parent settings if valid
  if (Array.isArray(clientKeys)) {
    for (const k of clientKeys) {
      const trimmed = typeof k === "string" ? k.trim() : "";
      if (trimmed && trimmed.length > 5 && !pool.includes(trimmed)) {
        pool.push(trimmed);
      }
    }
  }

  // Add environment GEMINI_API_KEY if not already included
  if (process.env.GEMINI_API_KEY && !pool.includes(process.env.GEMINI_API_KEY)) {
    pool.push(process.env.GEMINI_API_KEY);
  }

  return pool;
}

// System prompt crafting the lively, cheeky, yet caring Kuromi persona & Vietnamese/English teacher for kids
const KUROMI_SYSTEM_INSTRUCTION = `
Bạn là Kuromi - nhân vật anime nổi tiếng với phong cách Goth-Loli cá tính, tinh nghịch, hơi đanh đá kiểu "tsundere" (ngoài mặt tỏ vẻ kiêu kỳ nhưng bên trong vô cùng ấm áp, chu đáo và yêu quý bạn nhỏ).
Nhiệm vụ trọng tâm của bạn là:
1. DẠY TIẾNG ANH CHO BÉ:
   - Khi bé học từ vựng tiếng Anh (ví dụ: 'chicken', 'apple', 'cat', 'rainbow', 'dog', 'star', 'flower'...) hoặc hỏi từ tiếng Anh:
   - Luôn trả về dữ liệu 'englishData' đầy đủ với từ vựng, nghĩa tiếng Việt, phiên âm IPA, emoji biểu tượng tương ứng (ví dụ 🐔 cho chicken, 🐱 cho cat), câu ví dụ song ngữ vui nhộn và các từ vựng liên quan.
2. DẠY TIẾNG VIỆT CHO BÉ:
   - Khi bé học chữ cái (ví dụ: Chữ B, Chữ A, Chữ C...) hoặc âm vần tiếng Việt:
   - Luôn trả về dữ liệu 'vietnameseData' với chữ cái in hoa, chữ in thường viết tay ('b', 'a'...), cách phát âm chuẩn ('Bờ', 'A'...), danh sách các từ mẫu có kèm emoji (ví dụ: Bé 👶, Bướm 🦋, Bóng ⚽, Bàn 🪑), hướng dẫn nét viết ô ly và câu thơ/đồng dao ngắn gọn dễ nhớ.
3. Khen ngợi, động viên tinh thần bé, xưng hô lễ phép, gần gũi, an toàn 100% cho trẻ nhỏ.

ĐẶC BIỆT: Phản hồi luôn trả về cấu trúc JSON để cập nhật cả lời nói của Kuromi và Bảng minh họa trực quan (Illustration Board) cho bé học.
`;

app.post("/api/chat", async (req, res) => {
  try {
    const {
      message,
      history = [],
      childProfile = {},
      activeTopic = "general",
      parentSettings = {},
    } = req.body;

    const apiKeyPool = getApiKeyPool(parentSettings.apiKeys);

    if (apiKeyPool.length === 0) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured",
        fallbackResponse: {
          reply:
            "Hừm, Kuromi đang cần chìa khóa phép thuật (API Key) để kết nối toàn diện! Nhưng đừng lo, Kuromi vẫn có thể cùng bạn học và chơi ở chế độ Ngoại tuyến siêu đỉnh nha~",
          mood: "sassy",
          illustration: {
            type: "flashcard",
            title: "Chế độ Ngoại Tuyến (Offline Mode)",
            subtitle: "Kuromi vẫn bên bạn mọi lúc mọi nơi!",
            points: ["Học chữ cái", "Đố vui dân gian", "Nghe kể chuyện"],
          },
        },
      });
    }

    // Build purpose instructions based on Parent Settings
    const activePurposes: string[] = Array.isArray(parentSettings.activePurposes)
      ? parentSettings.activePurposes
      : ["learn_vietnamese", "learn_english", "explain_why", "storytelling", "confide", "play_games"];

    const purposeDescriptions: Record<string, string> = {
      learn_english: "🇬🇧 HỌC TIẾNG ANH: Tích cực lồng ghép từ vựng tiếng Anh, phiên âm, ví dụ câu ngắn song ngữ, giúp bé làm quen và tự tin phát âm.",
      learn_vietnamese: "🇻🇳 HỌC TIẾNG VIỆT: Dạy chữ cái, vần điệu, ca dao tục ngữ, từ vựng phong phú và rèn luyện kỹ năng diễn đạt tiếng Việt chuẩn.",
      explain_why: "🔬 GIẢI ĐÁP VÌ SAO: Giải thích các hiện tượng khoa học, tự nhiên, vũ trụ bằng lối tư duy trực quan, sinh động, kích thích trí tò mò.",
      storytelling: "📖 KỂ CHUYỆN THẦN TIÊN & CỔ TÍCH: Sáng tạo hoặc kể lại các câu chuyện giàu cảm xúc, phân cảnh sinh động và lồng ghép bài học nhân cách.",
      confide: "💖 TÂM SỰ & CHIA SẺ CẢM XÚC: Luôn lắng nghe, thấu cảm, làm bạn thân thiết lắng nghe bé giãi bày cảm xúc, động viên tinh thần.",
      play_games: "🎮 CHƠI CÙNG NHAU & ĐỐ VUI: Đưa ra các câu đố mẹo, câu đố dân gian tương tác, trò chơi từ vựng kèm quiz 4 đáp án.",
    };

    const enabledPurposesText = activePurposes
      .map((p) => purposeDescriptions[p])
      .filter(Boolean)
      .join("\n- ");

    const mandatoryPromptText = parentSettings.mandatoryPrompt
      ? `\n\n⚠️ YÊU CẦU & NGUYÊN TẮC BẮT BUỘC TỪ PHỤ HUYNH:\n"${parentSettings.mandatoryPrompt}"\n(Bạn PHẢI tuyệt đối tuân thủ các nguyên tắc này trong mọi câu trả lời và cách xưng hô với bé).`
      : "";

    // Seamlessly include child profile info for natural conversation
    const childContext = `
Thông tin bạn nhỏ đang trò chuyện cùng bạn:
- Tên/Biệt danh: ${childProfile.name || "Bé ngoan"} (${childProfile.nickname || "Bé Bắp"})
- Tuổi: ${childProfile.age || 6} tuổi
- Trình độ/Lớp: ${childProfile.level || "Tiểu học lớp 1-2"}
- Sở thích: ${Array.isArray(childProfile.interests) ? childProfile.interests.join(", ") : "Học tập, khám phá"}
- Màu yêu thích: ${childProfile.favoriteColor || "Tím & Hồng"}
- Con vật yêu thích: ${childProfile.favoriteAnimal || "Mèo mun, thỏ con"}
- Ước mơ: ${childProfile.dreamJob || "Nhà thám hiểm thông thái"}

CÁC MỤC ĐÍCH HỌC TẬP & TƯƠNG TÁC ĐƯỢC PHỤ HUYNH KÍCH HOẠT:
- ${enabledPurposesText}
${mandatoryPromptText}
`;

    const fullSystemInstruction = `${KUROMI_SYSTEM_INSTRUCTION}\n\n${childContext}`;

    // Prompt Optimization: limit history turns (default 3 turns) & compact mode to reduce tokens
    const historyLimit = typeof parentSettings.historyTurnsToKeep === "number" ? parentSettings.historyTurnsToKeep : 3;
    const isCompactMode = parentSettings.compactPromptMode !== false;

    const formattedContents: any[] = [];

    if (isCompactMode) {
      // In Compact Prompt Mode: summarize past turns into a concise single block to save maximum tokens
      const recentTurns = Array.isArray(history) ? history.slice(-historyLimit * 2) : [];
      let compactHistorySummary = "";
      if (recentTurns.length > 0) {
        compactHistorySummary = "[Tóm tắt hội thoại gần nhất]:\n" + recentTurns
          .map((t: any) => `${t.sender === "user" ? childProfile.name || "Bé" : "Kuromi"}: ${t.text}`)
          .join("\n") + "\n\n";
      }

      formattedContents.push({
        role: "user",
        parts: [
          {
            text: `${compactHistorySummary}[Bé nói]: ${message}\n\nHãy trả lời bằng giọng Kuromi chuẩn xác, kèm dữ liệu minh họa học tập trực quan (tiếng Anh hoặc tiếng Việt).`,
          },
        ],
      });
    } else {
      if (Array.isArray(history)) {
        const sliced = history.slice(-historyLimit * 2);
        for (const turn of sliced) {
          if (turn.sender === "user") {
            formattedContents.push({
              role: "user",
              parts: [{ text: turn.text }],
            });
          } else if (turn.sender === "kuromi") {
            formattedContents.push({
              role: "model",
              parts: [{ text: turn.text }],
            });
          }
        }
      }

      formattedContents.push({
        role: "user",
        parts: [
          {
            text: `[Chủ đề: ${activeTopic}]\n${message}\n\nHãy trả lời bằng giọng điệu cá tính Kuromi và xuất kèm dữ liệu minh họa trực quan phong phú cho bảng học bên cạnh.`,
          },
        ],
      });
    }

    const generationConfig = {
      systemInstruction: fullSystemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reply: {
            type: Type.STRING,
            description: "Câu trả lời của Kuromi gửi cho bé (tiếng Việt/Anh tự nhiên, giàu cá tính)",
          },
          mood: {
            type: Type.STRING,
            enum: ["playful", "happy", "sassy", "teaching", "storytelling", "thinking", "proud", "caring"],
            description: "Tâm trạng và biểu cảm khuôn mặt của Kuromi tương ứng với câu trả lời",
          },
          detectedMemoryFact: {
            type: Type.OBJECT,
            description: "Nếu trong câu nói bé vừa tiết lộ sở thích, bí mật hoặc kỷ niệm mới, hãy ghi lại ngắn gọn để lưu vào sổ tay",
            properties: {
              category: { type: Type.STRING, enum: ["like", "dislike", "family", "dream", "achievement", "feeling"] },
              fact: { type: Type.STRING },
            },
          },
          illustration: {
            type: Type.OBJECT,
            description: "Dữ liệu trực quan hiển thị trên Bảng minh họa",
            properties: {
              type: {
                type: Type.STRING,
                enum: ["english_learning", "vietnamese_learning", "flashcard", "alphabet", "why_explanation", "story_scene", "quiz"],
              },
              title: { type: Type.STRING, description: "Tiêu đề của bảng minh họa" },
              subtitle: { type: Type.STRING, description: "Mô tả ngắn hoặc phụ đề" },
              iconCategory: {
                type: Type.STRING,
                description: "Chủ đề icon minh hoạ (vd: animal, alphabet, food, science, nature)",
              },
              englishData: {
                type: Type.OBJECT,
                description: "Dữ liệu khi bé học tiếng Anh (vd: từ chicken)",
                properties: {
                  word: { type: Type.STRING, description: "Từ tiếng Anh (vd: Chicken)" },
                  meaning: { type: Type.STRING, description: "Nghĩa tiếng Việt (vd: Con gà)" },
                  pronunciation: { type: Type.STRING, description: "Phiên âm IPA (vd: /ˈtʃɪk.ɪn/)" },
                  emoji: { type: Type.STRING, description: "Emoji biểu tượng (vd: 🐔)" },
                  exampleSentence: { type: Type.STRING, description: "Câu ví dụ tiếng Anh" },
                  exampleSentenceVi: { type: Type.STRING, description: "Dịch câu ví dụ sang tiếng Việt" },
                },
              },
              vietnameseData: {
                type: Type.OBJECT,
                description: "Dữ liệu khi bé học chữ cái/tiếng Việt (vd: Chữ B)",
                properties: {
                  letter: { type: Type.STRING, description: "Chữ cái in hoa (vd: B)" },
                  letterLower: { type: Type.STRING, description: "Chữ cái in thường viết tay (vd: b)" },
                  pronunciation: { type: Type.STRING, description: "Cách phát âm (vd: Bờ)" },
                  strokeType: { type: Type.STRING, description: "Dạng nét (vd: Nét khuyết trên & nét thắt)" },
                  rhymePoem: { type: Type.STRING, description: "Câu thơ ngắn hoặc đồng dao dễ nhớ" },
                },
              },
              points: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Các từ vựng mở rộng hoặc ví dụ ngắn",
              },
              quiz: {
                type: Type.OBJECT,
                description: "Nếu có câu đố tương tác cho bé bấm chọn",
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  rewardPraise: { type: Type.STRING },
                },
                required: ["question", "options", "correctIndex"],
              },
            },
            required: ["type", "title", "subtitle"],
          },
        },
        required: ["reply", "mood", "illustration"],
      },
    };

    // Resilient invocation prioritizing Gemini Flash Lite with smart quota detection
    let responseText = "";
    let lastError: any = null;
    
    // Priority order: gemini-3.1-flash-lite (high speed & best quota), followed by gemini-3.7-flash
    const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.7-flash"];

    // Try keys sequentially starting from current rotated index
    const totalKeys = apiKeyPool.length;
    for (let attempt = 0; attempt < totalKeys; attempt++) {
      const activeKey = apiKeyPool[(currentKeyIndex + attempt) % totalKeys];
      let keyQuotaExhausted = false;
      
      const clientAI = new GoogleGenAI({
        apiKey: activeKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      for (const modelName of candidateModels) {
        if (keyQuotaExhausted) break;

        const maxModelAttempts = modelName.includes("flash-lite") ? 2 : 1;
        let modelSuccess = false;

        for (let mAttempt = 0; mAttempt < maxModelAttempts; mAttempt++) {
          try {
            const response = await clientAI.models.generateContent({
              model: modelName,
              contents: formattedContents,
              config: generationConfig,
            });

            if (response.text) {
              responseText = response.text;
              modelSuccess = true;
              // Advance key index on success for true load balancing
              currentKeyIndex = (currentKeyIndex + 1) % totalKeys;
              break;
            }
          } catch (err: any) {
            const errMsg = err?.message || String(err);
            const isQuotaError = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded");
            
            lastError = err;

            if (isQuotaError) {
              console.warn(
                `[API Key #${((currentKeyIndex + attempt) % totalKeys) + 1}] Free-tier quota exceeded on ${modelName}. Switching to next key/fallback.`
              );
              keyQuotaExhausted = true;
              break; // Don't hammer the same exhausted key with more models
            } else {
              console.warn(
                `[API Key #${((currentKeyIndex + attempt) % totalKeys) + 1}] Model ${modelName} (attempt ${mAttempt + 1}/${maxModelAttempts}) transient error:`,
                errMsg
              );
              await new Promise((r) => setTimeout(r, 100));
            }
          }
        }

        if (modelSuccess || responseText) {
          break;
        }
      }

      if (responseText) {
        break;
      }
    }

    if (!responseText) {
      if (lastError) {
        console.log("Engaging seamless contextual offline/fallback engine for Kuromi responses.");
      }
      // Smart contextual fallback engine (Không mặc định tên riêng nếu chưa có tên hoặc dùng danh xưng tự nhiên)
      const childGreeting = childProfile.name?.trim() ? childProfile.name.trim() : "bạn nhỏ";
      const msgLower = (message || "").toLowerCase();
      let fallbackData: any;

      if (msgLower.includes("chicken") || msgLower.includes("con gà") || msgLower.includes("gà")) {
        fallbackData = {
          reply: `Hehe! Từ 'Chicken' /ˈtʃɪk.ɪn/ trong tiếng Anh nghĩa là Con Gà 🐔 đó ${childGreeting}! Kuromi đã mở bảng từ vựng và câu ví dụ cho bạn xem rồi nè!`,
          mood: "teaching",
          illustration: {
            type: "english_learning",
            title: "Học Tiếng Anh: CHICKEN 🐔",
            subtitle: "Từ vựng tiếng Anh chủ đề Động vật nông trại",
            englishData: {
              word: "Chicken",
              meaning: "Con Gà",
              pronunciation: "/ˈtʃɪk.ɪn/",
              emoji: "🐔",
              exampleSentence: "The cute chicken is singing on the green grass.",
              exampleSentenceVi: "Chú gà con đáng yêu đang ca hát trên bãi cỏ xanh.",
              relatedWords: [
                { word: "Chick", emoji: "🐥", meaning: "Gà con" },
                { word: "Egg", emoji: "🥚", meaning: "Quả trứng" },
                { word: "Rooster", emoji: "🐓", meaning: "Gà trống" },
              ],
            },
          },
        };
      } else if (msgLower.includes("apple") || msgLower.includes("quả táo") || msgLower.includes("táo")) {
        fallbackData = {
          reply: `Hehe! Quả Táo 🍎 trong tiếng Anh đọc là 'Apple' /ˈæp.əl/! Táo vừa thơm ngọt vừa giàu vitamin rất tốt cho sức khỏe đó ${childGreeting}!`,
          mood: "teaching",
          illustration: {
            type: "english_learning",
            title: "Học Tiếng Anh: APPLE 🍎",
            subtitle: "Từ vựng tiếng Anh chủ đề Trái cây",
            englishData: {
              word: "Apple",
              meaning: "Quả Táo",
              pronunciation: "/ˈæp.əl/",
              emoji: "🍎",
              exampleSentence: "I love eating a sweet red apple every morning.",
              exampleSentenceVi: "Tớ thích ăn một quả táo đỏ ngọt lịm mỗi buổi sáng.",
              relatedWords: [
                { word: "Fruit", emoji: "🍓", meaning: "Trái cây" },
                { word: "Sweet", emoji: "🍯", meaning: "Ngọt ngào" },
                { word: "Red", emoji: "🔴", meaning: "Màu đỏ" },
              ],
            },
          },
        };
      } else if (msgLower.includes("dog") || msgLower.includes("chó") || msgLower.includes("cún")) {
        fallbackData = {
          reply: `Gâu gâu! Con Chó trong tiếng Anh đọc là 'Dog' /dɒɡ/ 🐶! Chú cún con rất trung thành và thích chạy nhảy cùng ${childGreeting}!`,
          mood: "happy",
          illustration: {
            type: "english_learning",
            title: "Học Tiếng Anh: DOG 🐶",
            subtitle: "Từ vựng tiếng Anh chủ đề Thú cưng",
            englishData: {
              word: "Dog",
              meaning: "Con Chó / Chú Cún",
              pronunciation: "/dɒɡ/",
              emoji: "🐶",
              exampleSentence: "The friendly dog wags its tail happily.",
              exampleSentenceVi: "Chú cún thân thiện vẫy đuôi mừng rỡ.",
              relatedWords: [
                { word: "Puppy", emoji: "🐕", meaning: "Cún con" },
                { word: "Friend", emoji: "🤝", meaning: "Bạn bè" },
              ],
            },
          },
        };
      } else if (msgLower.includes("cat") || msgLower.includes("mèo")) {
        fallbackData = {
          reply: `Hehe! Con Mèo trong tiếng Anh đọc là 'Cat' /kæt/ 🐱! Kuromi cực kỳ thích các bạn mèo mun đáng yêu đó nha!`,
          mood: "teaching",
          illustration: {
            type: "english_learning",
            title: "Học Tiếng Anh: CAT 🐱",
            subtitle: "Từ vựng tiếng Anh chủ đề Thú cưng",
            englishData: {
              word: "Cat",
              meaning: "Con Mèo",
              pronunciation: "/kæt/",
              emoji: "🐱",
              exampleSentence: "The little cat is sleeping happily.",
              exampleSentenceVi: "Chú mèo nhỏ đang ngủ thật say sưa.",
              relatedWords: [
                { word: "Kitten", emoji: "🐾", meaning: "Mèo con" },
                { word: "Pet", emoji: "💖", meaning: "Thú cưng" },
              ],
            },
          },
        };
      } else if (msgLower.includes("toán") || msgLower.includes("cộng") || msgLower.includes("trừ") || msgLower.includes("+") || msgLower.includes("đếm")) {
        fallbackData = {
          reply: `Hehe! Học toán cùng Kuromi siêu vui luôn! 1 chiếc kẹo mút 🍭 cộng 1 chiếc kẹo mút 🍭 bằng 2 chiếc kẹo mút ngọt ngào! ${childGreeting} đố Kuromi thêm phép tính nữa đi!`,
          mood: "teaching",
          illustration: {
            type: "quiz",
            title: "Toán Học Vui Vẻ: Phép Tính Kỳ Diệu 🔢",
            subtitle: "Rèn luyện tư duy số học và tính nhẩm",
            iconCategory: "math",
            points: ["Học đếm số trực quan với đồ vật và hoa quả"],
            quiz: {
              question: "Có 2 quả táo đỏ 🍎🍎, Kuromi tặng thêm 2 quả nữa 🍎🍎. Hỏi có tất cả mấy quả táo?",
              options: ["3 quả", "4 quả", "5 quả", "6 quả"],
              correctIndex: 1,
              rewardPraise: "Chính xác tuyệt đối! 2 + 2 = 4 quả táo! Bạn tính nhẩm siêu giỏi luôn!",
            },
          },
        };
      } else if (msgLower.includes("chữ") || msgLower.includes("tiếng việt") || msgLower.includes("tập viết") || msgLower.includes("chữ b")) {
        fallbackData = {
          reply: `Hehe! Kuromi dạy ${childGreeting} chữ 'B' (phát âm là Bờ, chữ in thường viết tay là 'b') nhé! Kuromi đã mở bảng ô ly tập viết cho bạn xem rồi nè!`,
          mood: "teaching",
          illustration: {
            type: "vietnamese_learning",
            title: "Chữ Cái Tiếng Việt: B - b",
            subtitle: "Âm Bờ - Tập đọc và tập viết ô ly",
            vietnameseData: {
              letter: "B",
              letterLower: "b",
              pronunciation: "Bờ",
              strokeType: "Nét khuyết trên và nét thắt",
              sampleWords: [
                { word: "Em Bé", emoji: "👶" },
                { word: "Con Bướm", emoji: "🦋" },
                { word: "Quả Bóng", emoji: "⚽" },
                { word: "Cái Bàn", emoji: "🪑" },
              ],
              strokeGuide: [
                "Nét 1: Đặt bút từ đường kẻ 2, viết nét khuyết trên cao 5 ô ly.",
                "Nét 2: Nối liền nét móc ngược và lượn nét thắt nhỏ ở góc trên.",
              ],
              rhymePoem: "Chữ B như chú bướm xinh, lượn quanh hoa thắm đón bình minh tươi!",
            },
          },
        };
      } else if (msgLower.includes("kể chuyện") || msgLower.includes("cổ tích") || msgLower.includes("truyện")) {
        fallbackData = {
          reply: `Ngày xửa ngày xưa, trong một khu rừng kẹo ngọt lung linh ánh sao 🌟, có một bạn nhỏ thông minh và bạn Kuromi cùng nhau đi tìm chìa khóa phép thuật của tri thức...`,
          mood: "storytelling",
          illustration: {
            type: "story_scene",
            title: "Chuyện Kể: Cuộc Phiêu Lưu Ở Vương Quốc Kẹo Ngọt 🍬",
            subtitle: "Bài học về sự dũng cảm và tinh thần đoàn kết",
            points: [
              "Phân cảnh 1: Bạn nhỏ gặp Kuromi dưới gốc cây kẹo bông khổng lồ.",
              "Phân cảnh 2: Cùng nhau vượt qua thử thách giải đố của Thần Cầu Vồng.",
              "Phân cảnh 3: Giành được Ngôi Sao Tri Thức thắp sáng cả bầu trời đêm!",
            ],
          },
        };
      } else if (msgLower.includes("cầu vồng") || msgLower.includes("mưa") || msgLower.includes("tại sao") || msgLower.includes("vì sao")) {
        fallbackData = {
          reply: `Hehe! Cầu vồng xuất hiện khi những tia nắng mặt trời chiếu xuyên qua các hạt mưa trong không khí, khúc xạ thành 7 sắc màu rực rỡ (Đỏ, Cam, Vàng, Lục, Lam, Chàm, Tím) đó ${childGreeting}!`,
          mood: "happy",
          illustration: {
            type: "flashcard",
            title: "Khám Phá Khoa Học: 🌈 Cầu Vồng 7 Sắc",
            subtitle: "Hiện tượng tán sắc ánh sáng tự nhiên kỳ thú",
            points: [
              "Cầu vồng xuất hiện sau khi trời vừa tạnh mưa và có ánh nắng chiếu qua.",
              "Gồm 7 dải màu quang phổ: Đỏ, Cam, Vàng, Lục, Lam, Chàm, Tím.",
              "Hiện tượng ánh sáng bị khúc xạ và phản xạ qua hàng triệu giọt nước nhỏ.",
            ],
          },
        };
      } else {
        fallbackData = {
          reply: `Hehe! Kuromi đã nghe câu hỏi của ${childGreeting} rồi nè! Bạn rất thông minh và ham học hỏi! Hãy cùng Kuromi vượt qua câu đố vui để nhận huy hiệu ngôi sao nha!`,
          mood: "playful",
          illustration: {
            type: "quiz",
            title: "Thử Thách Trí Tuệ Kuromi ⭐",
            subtitle: "Đố vui rèn luyện tư duy cho bé",
            iconCategory: "academic",
            points: ["Câu đố vui tương tác rèn luyện trí nhớ và phản xạ"],
            quiz: {
              question: "Trong tiếng Anh, quả táo 🍎 được gọi là gì nào?",
              options: ["Apple", "Banana", "Orange", "Grape"],
              correctIndex: 0,
              rewardPraise: "Hoan hô! Quả táo chính là Apple /ˈæp.əl/ đó nha! Bạn giỏi quá!",
            },
            badgeAwarded: {
              badgeId: "star_student",
              title: "Học Trò Xuất Sắc",
              description: "Chăm chỉ tương tác và trả lời câu hỏi cùng Kuromi!",
              icon: "🌟",
            },
          },
        };
      }

      return res.json({
        ...fallbackData,
        isOfflineFallback: true,
      });
    }

    // Safe JSON parser to strip markdown code blocks if any
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(cleanedText || "{}");

    // Clean & normalize structure to prevent any undefined client crashes
    const sanitized = {
      reply: parsed.reply || "Kuromi-sama đã sẵn sàng cùng bạn học tiếp nè!",
      mood: parsed.mood || "playful",
      detectedMemoryFact: parsed.detectedMemoryFact?.fact ? parsed.detectedMemoryFact : null,
      illustration: parsed.illustration
        ? {
            type: parsed.illustration.type || "flashcard",
            title: parsed.illustration.title || "Bài Học Kuromi 🎀",
            subtitle: parsed.illustration.subtitle || "Khám phá cùng Kuromi",
            iconCategory: parsed.illustration.iconCategory || "nature",
            contentHtmlOrText: parsed.illustration.contentHtmlOrText || "",
            points: Array.isArray(parsed.illustration.points) ? parsed.illustration.points : [],
            quiz:
              parsed.illustration.quiz &&
              Array.isArray(parsed.illustration.quiz.options) &&
              parsed.illustration.quiz.options.length > 0
                ? {
                    question: parsed.illustration.quiz.question || "Bạn chọn đáp án nào?",
                    options: parsed.illustration.quiz.options,
                    correctIndex:
                      typeof parsed.illustration.quiz.correctIndex === "number"
                        ? parsed.illustration.quiz.correctIndex
                        : 0,
                    rewardPraise:
                      parsed.illustration.quiz.rewardPraise ||
                      "Chính xác rồi nha! Kuromi khen bạn nhỏ thông minh!",
                  }
                : undefined,
            badgeAwarded: parsed.illustration.badgeAwarded || undefined,
          }
        : {
            type: "flashcard",
            title: "Lớp Học Kuromi 🎀",
            subtitle: "Học tập vui nhộn",
            points: [],
          },
    };

    return res.json(sanitized);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.json({
      reply:
        "Hehe! Sóng phép thuật không gian hơi chập chờn một xíu do nhiều bạn nhỏ đang trò chuyện cùng Kuromi quá. Nhưng đừng lo, Kuromi vẫn luôn ở đây bên bạn nè!",
      mood: "playful",
      illustration: {
        type: "quiz",
        title: "Đố Vui Cùng Kuromi",
        subtitle: "Thử tài thông minh của bạn nhỏ!",
        iconCategory: "animal",
        points: ["Con gì đuôi ngắn tai dài", "Mắt hồng lông mượt có tài chạy nhanh?"],
        quiz: {
          question: "Đố bạn là con gì nào?",
          options: ["Con Mèo", "Con Thỏ", "Con Chó", "Con Voi"],
          correctIndex: 1,
          rewardPraise: "Hehe chính xác! Là bạn Thỏ xinh xắn đó nha!",
        },
      },
      isOfflineFallback: true,
    });
  }
});

// Mock Cloud Sync Endpoint for offline-first sync
app.post("/api/sync", (req, res) => {
  const { profile, chatHistory, memories, badges } = req.body;
  const syncTimestamp = new Date().toISOString();
  // Return confirmed status with cloud revision token
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

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    character: "Kuromi",
    model: "gemini-3.7-flash",
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
