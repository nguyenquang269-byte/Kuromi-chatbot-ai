import { GoogleGenAI, Type } from "@google/genai";

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

  // Add environment variables (GEMINI_API_KEY or VITE_GEMINI_API_KEY)
  const envKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (envKey && !pool.includes(envKey.trim())) {
    pool.push(envKey.trim());
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
2. DẠY TIẾNG VIỆT & LUYỆN CHỮ CHO BÉ:
   - Khi bé học chữ cái (ví dụ: Chữ A, B, C...) hoặc âm vần tiếng Việt:
   - Luôn trả về dữ liệu 'vietnameseData' với chữ cái in hoa, chữ in thường viết tay ('b', 'a'...), cách phát âm chuẩn ('Bờ', 'A'...), danh sách các từ mẫu có kèm emoji (ví dụ: Bé 👶, Bướm 🦋, Bóng ⚽, Bàn 🪑), hướng dẫn nét viết ô ly HP001 và câu thơ/đồng dao ngắn gọn dễ nhớ.
3. TOÁN HỌC TRỰC QUAN & ĐỐ VUI:
   - Giải thích phép tính số học bằng hình ảnh, đồ vật vui mắt, đố vui tư duy kèm 4 đáp án trắc nghiệm (quiz).
4. Khen ngợi, động viên tinh thần bé, xưng hô thân mật là Kuromi và gọi bạn nhỏ bằng tên, an toàn 100% cho trẻ nhỏ.

ĐẶC BIỆT: Phản hồi luôn trả về cấu trúc JSON để cập nhật cả lời nói của Kuromi và Bảng minh họa trực quan (Illustration Board) cho bé học.
`;

export async function handleChat(req: any, res: any) {
  // Handle CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    body = body || {};

    const {
      message = "",
      history = [],
      childProfile = {},
      activeTopic = "vietnamese_education",
      parentSettings = {},
    } = body;

    const apiKeyPool = getApiKeyPool(parentSettings.apiKeys);

    // Build purpose instructions based on Parent Settings
    const activePurposes: string[] = Array.isArray(parentSettings.activePurposes)
      ? parentSettings.activePurposes
      : ["learn_vietnamese", "learn_english", "explain_why", "storytelling", "confide", "play_games"];

    const purposeDescriptions: Record<string, string> = {
      learn_english: "🇬🇧 HỌC TIẾNG ANH: Tích cực lồng ghép từ vựng tiếng Anh, phiên âm, ví dụ câu ngắn song ngữ, giúp bé làm quen và tự tin phát âm.",
      learn_vietnamese: "🇻🇳 HỌC TIẾNG VIỆT & TẬP VIẾT: Dạy chữ cái chuẩn ô ly HP001, vần điệu, ca dao tục ngữ, từ vựng phong phú và rèn luyện kỹ năng diễn đạt tiếng Việt chuẩn.",
      explain_why: "🔬 GIẢI ĐÁP VÀI CÂU HỎI VÌ SAO: Giải thích các hiện tượng khoa học, tự nhiên, vũ trụ bằng lối tư duy trực quan, sinh động, kích thích trí tò mò.",
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
            text: `${compactHistorySummary}[Bé nói]: ${message}\n\nHãy trả lời bằng giọng Kuromi chuẩn xác, kèm dữ liệu minh họa học tập trực quan (tiếng Anh hoặc tiếng Việt hoặc bảng chữ cái / câu đố).`,
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

    let responseText = "";
    let lastError: any = null;

    // Fast and highly available model candidate list
    // Primary: gemini-3.1-flash-lite (high quota & ultra-fast)
    // Secondary: gemini-3.7-flash
    const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.7-flash"];

    if (apiKeyPool.length > 0) {
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

          try {
            const response = await clientAI.models.generateContent({
              model: modelName,
              contents: formattedContents,
              config: generationConfig,
            });

            if (response.text) {
              responseText = response.text;
              currentKeyIndex = (currentKeyIndex + 1) % totalKeys;
              break;
            }
          } catch (err: any) {
            const errMsg = err?.message || String(err);
            const isQuotaError =
              errMsg.includes("429") ||
              errMsg.includes("RESOURCE_EXHAUSTED") ||
              errMsg.includes("Quota exceeded");

            lastError = err;

            if (isQuotaError) {
              console.warn(`[Key #${attempt + 1}] Quota limit on ${modelName}, trying next candidate...`);
              keyQuotaExhausted = true;
              break;
            } else {
              console.warn(`[Key #${attempt + 1}] Error on ${modelName}:`, errMsg.slice(0, 120));
            }
          }
        }

        if (responseText) {
          break;
        }
      }
    }

    // If Gemini returned a response, parse it
    if (responseText) {
      let cleanedText = responseText.trim();
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(cleanedText || "{}");

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
              englishData: parsed.illustration.englishData || undefined,
              vietnameseData: parsed.illustration.vietnameseData || undefined,
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

      return res.status(200).json(sanitized);
    }

    // Contextual intelligent fallback if no API key or network down
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
    } else if (msgLower.includes("chữ a") || msgLower.includes("chữ cái") || msgLower.includes("ô ly") || msgLower.includes("hp001") || msgLower.includes("tập viết")) {
      fallbackData = {
        reply: `Hehe! Kuromi dạy ${childGreeting} chữ 'A' (phát âm là Âm A, chữ thường viết tay là 'a' cao 2 ô ly chuẩn HP001) nhé! Hãy mở bảng vẽ ô ly để tập tô cùng Kuromi nào!`,
        mood: "teaching",
        illustration: {
          type: "vietnamese_learning",
          title: "Chữ Cái Tiếng Việt: A - a",
          subtitle: "Âm A - Chuẩn vở ô ly 4 hàng HP001",
          vietnameseData: {
            letter: "A",
            letterLower: "a",
            pronunciation: "A",
            strokeType: "Nét cong kín và nét móc ngược phải",
            sampleWords: [
              { word: "Quả Áo", emoji: "👕" },
              { word: "Cái Ấm", emoji: "🫖" },
              { word: "Con Cá", emoji: "🐟" },
              { word: "Mẹ À", emoji: "👩" },
            ],
            strokeGuide: [
              "Nét 1: Đặt bút dưới đường kẻ 3 một chút, viết nét cong kín cao 2 ô ly.",
              "Nét 2: Lia bút lên đường kẻ 3, viết nét móc ngược phải sát nét cong kín, dừng bút ở đường kẻ 2.",
            ],
            rhymePoem: "Chữ A chúm chím miệng cười, em vui đi học vâng lời mẹ cha!",
          },
        },
      };
    } else if (msgLower.includes("cộng") || msgLower.includes("trừ") || msgLower.includes("toán") || msgLower.includes("+") || msgLower.includes("-")) {
      fallbackData = {
        reply: `Hehe! Cùng Kuromi giải bài toán vui nhé! Có 3 que kem dâu 🍓🍓🍓, Kuromi tặng thêm 2 que kem nữa 🍓🍓. Tổng cộng là 3 + 2 = 5 que kem ngon tuyệt đó ${childGreeting}!`,
        mood: "teaching",
        illustration: {
          type: "quiz",
          title: "Toán Vui Trực Quan: 3 + 2 = ? 🧮",
          subtitle: "Phép cộng trực quan sinh động",
          iconCategory: "math",
          points: ["3 que kem dâu + 2 que kem vani = 5 que kem!"],
          quiz: {
            question: "3 + 2 bằng bao nhiêu nào bạn nhỏ?",
            options: ["4 que kem", "5 que kem", "6 que kem", "7 que kem"],
            correctIndex: 1,
            rewardPraise: "Hoan hô! 3 + 2 = 5! Bạn tính toán siêu chuẩn!",
          },
        },
      };
    } else if (msgLower.includes("kể chuyện") || msgLower.includes("cổ tích") || msgLower.includes("truyện") || msgLower.includes("cây khế")) {
      fallbackData = {
        reply: `Ngày xửa ngày xưa, có hai anh em nhà nọ mồ côi cha mẹ. Người anh tham lam chiếm hết gia tài, chỉ để lại cho người em một cây khế ngọt. Một ngày nọ, chim Phượng Hoàng thần bay đến ăn khế và nói: 'Ăn một quả, trả một cục vàng, may túi ba gang mang đi mà đựng'...`,
        mood: "storytelling",
        illustration: {
          type: "story_scene",
          title: "Truyện Cổ Tích: Sự Tích Cây Khế 🌳",
          subtitle: "Bài học về lòng nhân hậu và sự trung thực",
          points: [
            "Cảnh 1: Cây khế của người em sai trĩu quả ngọt.",
            "Cảnh 2: Chim phượng hoàng chở người em ra đảo vàng.",
            "Cảnh 3: Người anh tham lam may túi mười hai gang và cái kết thích đáng.",
          ],
        },
      };
    } else if (msgLower.includes("cười") || msgLower.includes("hài") || msgLower.includes("vui")) {
      fallbackData = {
        reply: `Hi hi hi! Đố bạn nhỏ: Con gì càng cất lại càng to ra? 😂... Đó chính là Cái Hố đất đó nha! Hi hi! Bạn có thấy buồn cười không nào?`,
        mood: "happy",
        illustration: {
          type: "flashcard",
          title: "Chuyện Cười Nhí Nhảnh Cùng Kuromi 😂",
          subtitle: "Nụ cười sảng khoái mỗi ngày",
          points: [
            "Con gì cất đi thì to ra? -> Cái hố đất!",
            "Kuromi chúc bạn nhỏ luôn nở nụ cười thật tươi nhé!",
          ],
        },
      };
    } else {
      fallbackData = {
        reply: `Hi hi! Kuromi đã lắng nghe bạn ${childGreeting} rồi nè! 💖 Bạn muốn cùng Kuromi tập viết chữ A chuẩn ô ly HP001, học từ vựng tiếng Anh, giải toán đố hay nghe Kuromi kể chuyện cổ tích nào?`,
        mood: "playful",
        illustration: {
          type: "quiz",
          title: "Khám Phá Cùng Kuromi 🎀",
          subtitle: `Chào mừng bạn ${childGreeting}`,
          iconCategory: "academic",
          points: [
            "✍️ Luyện chữ ô ly HP001 chuẩn 4 hàng tiểu học",
            "🇬🇧 Kho từ vựng tiếng Anh kèm phát âm",
            "🧮 Giải toán trực quan & Đố vui dân gian",
          ],
          quiz: {
            question: "Trong tiếng Anh, con mèo 🐱 được gọi là gì?",
            options: ["Dog", "Cat", "Bird", "Fish"],
            correctIndex: 1,
            rewardPraise: "Chính xác! Con mèo trong tiếng Anh là Cat /kæt/ đó nha!",
          },
        },
      };
    }

    return res.status(200).json({
      ...fallbackData,
      isOfflineFallback: true,
    });
  } catch (err: any) {
    console.error("Chat Handler Error:", err);
    return res.status(200).json({
      reply: "Hehe! Kuromi vẫn luôn sẵn sàng đồng hành cùng bạn học tập và vui chơi thật vui vẻ nè! 🎀",
      mood: "happy",
      illustration: {
        type: "flashcard",
        title: "Lớp Học Thần Kỳ Kuromi",
        subtitle: "Đồng hành cùng bé mỗi ngày",
        points: ["Tập viết chữ ô ly", "Học tiếng Anh", "Đố vui sáng tạo"],
      },
      isOfflineFallback: true,
    });
  }
}

export default handleChat;
