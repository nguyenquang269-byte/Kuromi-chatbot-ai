import { PrebuiltLesson } from "../types";

export const PREBUILT_LESSONS: PrebuiltLesson[] = [
  // 1. English Vocabulary Lessons (with animated emoji & phonetics)
  {
    id: "lesson_english_chicken",
    title: "Từ Tiếng Anh: Chicken 🐔",
    category: "vocabulary",
    iconName: "feather",
    badge: "Tiếng Anh 101",
    shortDesc: "Học từ Chicken (Con gà), phiên âm và câu ví dụ sinh động.",
    promptToAsk: "Kuromi ơi, dạy bé từ tiếng Anh 'Chicken' (Con gà) nhé!",
    offlineIllustration: {
      type: "english_learning",
      title: "Học Tiếng Anh: CHICKEN 🐔",
      subtitle: "Từ vựng tiếng Anh chủ đề Động vật",
      iconCategory: "animal",
      englishData: {
        word: "Chicken",
        meaning: "Con Gà",
        pronunciation: "/ˈtʃɪk.ɪn/",
        emoji: "🐔",
        exampleSentence: "Look at the cute yellow chicken: Cluck cluck!",
        exampleSentenceVi: "Nhìn chú gà màu vàng đáng yêu nè: Cục ta cục tác!",
        relatedWords: [
          { word: "Chick", emoji: "🐥", meaning: "Gà con" },
          { word: "Egg", emoji: "🥚", meaning: "Quả trứng" },
          { word: "Hen", emoji: "🐔", meaning: "Gà mái" },
          { word: "Rooster", emoji: "🐓", meaning: "Gà trống" },
        ],
      },
      points: [
        "Từ: Chicken /ˈtʃɪk.ɪn/ nghĩa là Con Gà 🐔",
        "Gà con gọi là Chick 🐥",
        "Trứng gà gọi là Egg 🥚",
      ],
    },
    offlineReply:
      "Hehe! Từ 'Chicken' trong tiếng Anh có nghĩa là 'Con Gà' đó nha! Bé đọc theo Kuromi nào: CHICK-EN! Chú gà con vàng óng cục ta cục tác rất đáng yêu đúng không nào?",
  },
  {
    id: "lesson_english_cat",
    title: "Từ Tiếng Anh: Cat 🐱",
    category: "vocabulary",
    iconName: "cat",
    badge: "Tiếng Anh 101",
    shortDesc: "Học từ Cat (Con mèo) kêu Meo Meo.",
    promptToAsk: "Kuromi ơi, dạy bé từ tiếng Anh 'Cat' (Con mèo) đi!",
    offlineIllustration: {
      type: "english_learning",
      title: "Học Tiếng Anh: CAT 🐱",
      subtitle: "Từ vựng tiếng Anh chủ đề Động vật",
      iconCategory: "animal",
      englishData: {
        word: "Cat",
        meaning: "Con Mèo",
        pronunciation: "/kæt/",
        emoji: "🐱",
        exampleSentence: "The black cat is playful and purrs happily.",
        exampleSentenceVi: "Chú mèo đen nghịch ngợm đang kêu gừ gừ vui vẻ.",
        relatedWords: [
          { word: "Kitten", emoji: "🐈", meaning: "Mèo con" },
          { word: "Fish", emoji: "🐟", meaning: "Con cá" },
          { word: "Milk", emoji: "🥛", meaning: "Sữa tươi" },
        ],
      },
      points: [
        "Từ: Cat /kæt/ nghĩa là Con Mèo 🐱",
        "Mèo con gọi là Kitten 🐈",
        "Mèo thích ăn Fish (Cá) 🐟 và uống Milk (Sữa) 🥛",
      ],
    },
    offlineReply:
      "Meo meo! 'Cat' nghĩa là Con Mèo, giống như người bạn mèo mun của Kuromi đó! Bé phát âm thật to cùng Kuromi: C-A-T... CAT!",
  },

  // 2. Vietnamese Alphabet & Phonics (Chữ in hoa & Viết thường Handwriting)
  {
    id: "lesson_alphabet_a",
    title: "Chữ A - Con Gà Gáy Sáng",
    category: "alphabet",
    iconName: "alphabet",
    badge: "Tiếng Việt 101",
    shortDesc: "Tập phát âm chữ A, chữ viết thường a và từ vựng mẫu.",
    promptToAsk: "Kuromi ơi, dạy bé học chữ A và các từ có chữ A nhé!",
    offlineIllustration: {
      type: "vietnamese_learning",
      title: "Chữ Cái Tiếng Việt: A - a",
      subtitle: "Phát âm: A... A... A...",
      iconCategory: "alphabet",
      vietnameseData: {
        letter: "A",
        letterLower: "a",
        pronunciation: "A",
        strokeType: "Nét cong kín và nét móc ngược",
        sampleWords: [
          { word: "Con Gà", emoji: "🐔" },
          { word: "Quả Na", emoji: "🍈" },
          { word: "Cái Ca", emoji: "🥛" },
          { word: "Con Cá", emoji: "🐟" },
        ],
        strokeGuide: [
          "Nét 1: Nét cong kín đặt bút dưới đường kẻ 3.",
          "Nét 2: Nét móc ngược sát bên phải nét cong kín.",
        ],
        rhymePoem: "Cục ta cục tác, gà trống gáy vang, chữ a rộn ràng đón chào nắng sớm!",
      },
      points: [
        "Chữ A trong từ: Con GÀ 🐔",
        "Chữ A trong từ: Quả NA 🍈",
        "Chữ A trong từ: Cái CA 🥛",
      ],
    },
    offlineReply:
      "Hehe, bài học chữ cái đầu tiên bắt đầu nào! Chữ 'A' (in thường là 'a' viết tay) là chữ cái mở đầu siêu dễ thương. Hãy há to miệng và nói thật to cùng Kuromi: Aaaaa!",
  },
  {
    id: "lesson_alphabet_b",
    title: "Chữ B - Bạn Bướm Bay Lượn",
    category: "alphabet",
    iconName: "alphabet",
    badge: "Tiếng Việt 101",
    shortDesc: "Học chữ B in hoa và chữ b viết thường font handwriting.",
    promptToAsk: "Kuromi ơi, dạy bé học chữ B và các con vật bắt đầu bằng chữ B đi!",
    offlineIllustration: {
      type: "vietnamese_learning",
      title: "Chữ Cái Tiếng Việt: B - b",
      subtitle: "Bờ... Bờ... Búp bê xinh, Bạn bướm lượn!",
      iconCategory: "alphabet",
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
          { word: "Bông Hoa", emoji: "🌸" },
        ],
        strokeGuide: [
          "Nét 1: Đặt bút ở đường kẻ 2, viết nét khuyết trên cao 5 ô ly.",
          "Nét 2: Nối liền nét móc ngược và lượn vào trong tạo nét thắt nhỏ ở đường kẻ 3.",
        ],
        rhymePoem: "Chữ B như chú bướm xinh, lượn quanh hoa thắm đón chào bình minh!",
      },
      points: [
        "Chữ B trong: Con BƯỚM 🦋",
        "Chữ B trong: Quả BÓNG ⚽",
        "Chữ B trong: Em BÉ 👶",
      ],
    },
    offlineReply:
      "Chữ 'B' (phát âm là Bờ, chữ viết thường nét uốn là 'b') giống như 2 quả bóng tròn gắn vào thân que gậy! Bạn Bướm, Em Bé, Bông Hoa đều có chữ B đó nha!",
  },

  // 2. Science "Why" Explanations (Kho tàng vì sao)
  {
    id: "why_rain",
    title: "Vì Sao Trời Lại Mưa?",
    category: "why_science",
    iconName: "cloud-rain",
    badge: "Vạn Câu Hỏi Vì Sao",
    shortDesc: "Hành trình giọt nước bay lên trời thành mây rồi rơi xuống thành mưa.",
    promptToAsk: "Kuromi giải thích cho bé vì sao trên trời lại có mưa rơi xuống vậy?",
    offlineIllustration: {
      type: "why_explanation",
      title: "Bí Mật Vòng Tuần Hoàn Của Nước",
      subtitle: "Chuyến du lịch kỳ thú của bạn Giọt Nước Tí Hon!",
      iconCategory: "nature",
      points: [
        "1. Mặt trời sưởi ấm nước ao hồ, sông suối bốc hơi bay lên cao ☀️",
        "2. Hơi nước gặp lạnh đọng lại thành những đám mây bồng bềnh ☁️",
        "3. Khi mây quá nặng, các giọt nước rơi xuống tạo thành MƯA 🌧️",
        "4. Nước mưa tưới mát cây cối rồi lại chảy về sông hồ!",
      ],
      quiz: {
        question: "Đám mây trên trời được tạo thành từ gì?",
        options: ["Kẹo bông gòn", "Hơi nước bốc lên", "Khói xe", "Bột mì"],
        correctIndex: 1,
        rewardPraise: "Đúng rồi nè! Đám mây trông giống kẹo bông nhưng thực ra là hàng triệu hạt nước li ti đó!",
      },
    },
    offlineReply:
      "Hừm, câu hỏi này Kuromi biết rõ nhất nè! Khi ông Mặt Trời chiếu nắng ấm, nước dưới đất sẽ hóa thành hơi nước bay vút lên trời tạo thành mây. Đến khi mây rủ nhau tụ họp đông quá, nặng trĩu, chúng sẽ biến thành những hạt mưa rơi xuống mát rượi!",
  },
  {
    id: "why_rainbow",
    title: "Vì Sao Cầu Vồng Có 7 Màu?",
    category: "why_science",
    iconName: "sparkles",
    badge: "Vạn Câu Hỏi Vì Sao",
    shortDesc: "Ánh sáng mặt trời đi qua giọt nước mưa tách thành dải 7 sắc diệu kỳ.",
    promptToAsk: "Kuromi ơi, vì sao sau cơn mưa lại xuất hiện cầu vồng 7 màu sắc?",
    offlineIllustration: {
      type: "why_explanation",
      title: "Cầu Vồng 7 Sắc Lung Linh",
      subtitle: "Lăng kính ánh sáng của Mẹ Thiên Nhiên",
      iconCategory: "nature",
      points: [
        "Đỏ (Red) - Cam (Orange) - Vàng (Yellow) ❤️🧡💛",
        "Lục (Green) - Lam (Cyan) 💚💙",
        "Chàm (Indigo) - Tím (Violet - Màu của Kuromi!) 💜",
        "Hiện tượng khúc xạ: Giọt nước mưa đóng vai trò như chiếc gương thần tách ánh sáng!",
      ],
      quiz: {
        question: "Màu sắc đặc trưng gắn liền với Kuromi nằm ở cuối cầu vồng là màu gì?",
        options: ["Màu Đỏ", "Màu Xanh Lá", "Màu Tím (Violet)", "Màu Vàng"],
        correctIndex: 2,
        rewardPraise: "Hehe chuẩn luôn! Màu tím quý phái của Kuromi là màu đẹp nhất cầu vồng đó!",
      },
    },
    offlineReply:
      "Ánh sáng mặt trời nhìn thì trong veo nhưng thực ra giấu bên trong 7 màu sắc diệu kỳ. Khi tia nắng xuyên qua những hạt mưa còn đọng trong không khí, hạt nước như chiếc gương thần tách ánh sáng ra thành Đỏ, Cam, Vàng, Lục, Lam, Chàm và Tím!",
  },
  {
    id: "why_cats_purr",
    title: "Vì Sao Mèo Kêu 'Gừ Gừ'?",
    category: "why_science",
    iconName: "heart",
    badge: "Thế Giới Động Vật",
    shortDesc: "Ngôn ngữ bí mật khi các bạn mèo cảm thấy hạnh phúc, an toàn và muốn được vuốt ve.",
    promptToAsk: "Tại sao khi vuốt ve mèo con, bạn ấy lại phát ra tiếng gừ gừ rung rung vậy Kuromi?",
    offlineIllustration: {
      type: "why_explanation",
      title: "Tiếng 'Gừ Gừ' Bí Ẩn Của Mèo",
      subtitle: "Khi mèo con cảm thấy yêu thương và an tâm!",
      iconCategory: "animal",
      points: [
        "Âm thanh rung phát ra từ thanh quản và cơ hoành của mèo 🐾",
        "Biểu thị mèo đang rất thư giãn, yêu mến bạn và cảm thấy được bảo vệ 💕",
        "Mèo mẹ cũng gừ gừ để dỗ dành mèo con ngủ ngon!",
        "Kuromi cũng có một bạn mèo đen dễ thương lắm đó nha!",
      ],
      quiz: {
        question: "Khi mèo kêu gừ gừ và cọ đầu vào bạn, bạn mèo đang muốn nói điều gì?",
        options: ["Tớ đang tức giận!", "Tớ rất quý và tin tưởng bạn!", "Tớ muốn chạy trốn", "Tớ đang bị lạnh"],
        correctIndex: 1,
        rewardPraise: "Chính xác! Bé hiểu tâm lý bạn mèo quá đi thôi!",
      },
    },
    offlineReply:
      "Meo meo~ Tiếng 'gừ gừ' ấy giống như bản nhạc tình bạn của loài mèo vậy đó! Khi bé vuốt ve nhẹ nhàng, mèo con cảm thấy an toàn tuyệt đối và muốn nói: 'Tớ thích ở cạnh bạn lắm đó!'.",
  },

  // 3. Fairy Tales & Bedtime Stories
  {
    id: "story_carambola_tree",
    title: "Sự Tích Cây Khế",
    category: "fairy_tale",
    iconName: "book-open",
    badge: "Cổ Tích Việt Nam",
    shortDesc: "Câu chuyện dân gian dạy bé lòng hiền lành, trung thực và biết sẻ chia.",
    promptToAsk: "Kuromi kể cho bé nghe chuyện cổ tích Sự Tích Cây Khế với giọng kịch tính nhé!",
    offlineIllustration: {
      type: "story_scene",
      title: "Chuyện Cổ Tích: Sự Tích Cây Khế",
      subtitle: "Ăn một quả khế, trả một cục vàng, may túi ba gang, mang đi mà đựng!",
      iconCategory: "fairy_tale",
      points: [
        "Hồi xưa có hai anh em, người anh tham lam chiếm hết gia tài, người em chỉ được túp lều và cây khế.",
        "Chim phượng hoàng khổng lồ đến ăn khế chín và trả ơn bằng vàng bạc.",
        "Người em hiền lành giàu có nhưng vẫn khiêm tốn, giúp đỡ dân làng nghèo.",
        "Bài học: Ở hiền gặp lành, tham lam thì sẽ nhận hậu quả không tốt.",
      ],
      quiz: {
        question: "Chim phượng hoàng dặn may túi bao nhiêu gang để đựng vàng?",
        options: ["Túi 10 gang", "Túi 3 gang", "Túi 5 gang", "Túi 1 gang"],
        correctIndex: 1,
        rewardPraise: "Đúng rồi! 'Túi ba gang' vừa vặn, không được tham lam nhé bé yêu!",
      },
    },
    offlineReply:
      "Hừm, ngồi ngoan để Kuromi đại nhân kể chuyện cho nghe nè! Ngày xưa ngày xửa... Có hai anh em nhà nọ. Người em hiền lành chỉ có một cây khế ngọt. Chim phượng hoàng đến ăn và cất tiếng nói diệu kỳ: 'Ăn một quả khế, trả một cục vàng, may túi ba gang, mang đi mà đựng'... Nhớ nhé, lòng nhân ái sẽ luôn được đền đáp!",
  },
  {
    id: "story_tortoise_hare",
    title: "Rùa và Thỏ - Bài Học Kiên Trì",
    category: "fairy_tale",
    iconName: "book-open",
    badge: "Ngụ Ngôn Ý Nghĩa",
    shortDesc: "Dù thỏ chạy rất nhanh nhưng vì kiêu ngạo nên rùa chăm chỉ đã chiến thắng.",
    promptToAsk: "Kuromi kể chuyện Rùa và Thỏ và bài học cho bé rút ra nhé!",
    offlineIllustration: {
      type: "story_scene",
      title: "Cuộc Thi Chạy: Rùa và Thỏ",
      subtitle: "Chậm mà chắc, kiên trì ắt thành công!",
      iconCategory: "animal",
      points: [
        "Thỏ ỷ mình chạy nhanh nên cợt nhả, nằm ngủ dưới gốc cây 🐇💤",
        "Rùa biết mình chậm chạp nên từng bước từng bước kiên trì không nghỉ 🐢✨",
        "Kết quả: Rùa chạm vạch đích trước trong sự ngỡ ngàng của thỏ kiêu căng!",
        "Lời khuyên của Kuromi: Học tiếng Việt hay bất cứ môn nào cũng cần chăm chỉ từng ngày!",
      ],
      quiz: {
        question: "Vì sao bạn Rùa chậm chạp lại chiến thắng bạn Thỏ chạy nhanh?",
        options: ["Vì Rùa đi xe máy", "Vì Thỏ ngủ quên và Rùa kiên trì", "Vì đường đua bị ngắn lại", "Vì Thỏ nhường Rùa"],
        correctIndex: 1,
        rewardPraise: "Quá xuất sắc! Kiên trì và không chủ quan là bí quyết thành công!",
      },
    },
    offlineReply:
      "Hehe, bạn Thỏ trong truyện này xí xọn giống ai đó ghê (nhưng không dễ thương bằng Kuromi đâu nha)! Thỏ cậy mình tài giỏi nên mải chơi, còn bạn Rùa chăm chỉ bước từng bước vững chắc. Cuối cùng ai kiên trì thì người đó chiến thắng!",
  },

  // 4. Riddles & Mini-Games (Đố vui rèn trí tuệ)
  {
    id: "riddle_folk_1",
    title: "Đố Vui Dân Gian: Con Gà Trống",
    category: "riddle",
    iconName: "help-circle",
    badge: "Trạng Nhí",
    shortDesc: "Câu đố về loài vật thân quen cất tiếng gáy báo hiệu bình minh.",
    promptToAsk: "Kuromi ơi đố bé một câu đố vui dân gian về loài vật đi!",
    offlineIllustration: {
      type: "quiz",
      title: "Đố Vui Dân Gian Cùng Kuromi",
      subtitle: "Nhìn câu thơ và đoán tên con vật nhé!",
      iconCategory: "animal",
      points: [
        "'Đầu đội mũ đỏ'",
        "'Áo choàng ngũ sắc rực rỡ'",
        "'Sáng sớm gáy vang: Ò... ó... o... gọi mặt trời thức giấc!'",
      ],
      quiz: {
        question: "Đố bạn nhỏ của Kuromi đây là con gì?",
        options: ["Con Vịt", "Con Gà Trống", "Con Chim Vẹt", "Con Bồ Câu"],
        correctIndex: 1,
        rewardPraise: "Ò ó o! Chính xác 100%! Bé xứng đáng là Trạng Nhí thông thái!",
      },
    },
    offlineReply:
      "Thách bạn nhỏ giải được câu đố này của Kuromi nè: 'Đầu đội nón đỏ, khoác áo ngũ sắc, sáng sớm gáy vang, rộn ràng làng xóm?' Bé đoán xem là ai nào?",
  },

  // 5. Confide & Emotional Support
  {
    id: "confide_cheerup",
    title: "Khi Bé Thấy Buồn Hay Lo Lắng",
    category: "confide",
    iconName: "sparkles",
    badge: "Trái Tim Ấm Áp",
    shortDesc: "Kuromi lắng nghe những tâm tư, nỗi buồn ở trường và gửi một cái ôm phép thuật.",
    promptToAsk: "Hôm nay bé có chuyện buồn ở lớp, Kuromi tâm sự và cho bé lời khuyên với...",
    offlineIllustration: {
      type: "flashcard",
      title: "Góc Tâm Sự: Kuromi Luôn Ở Cạnh Bé",
      subtitle: "Hít thở thật sâu, mọi chuyện rồi sẽ ổn thôi mà!",
      iconCategory: "emotion",
      points: [
        "1. Uống một ngụm nước ấm và thở sâu 3 nhịp 🫖",
        "2. Chia sẻ với Kuromi hoặc ba mẹ điều làm bạn buồn hôm nay 💌",
        "3. Nhớ rằng: Sau cơn mưa u ám, cầu vồng rực rỡ sẽ luôn xuất hiện 🌈",
        "4. Kuromi tặng bạn một chiếc ôm ma thuật ấm áp nhất! 💜",
      ],
    },
    offlineReply:
      "Hừm... ai dám làm bạn nhỏ của Kuromi buồn thế hả?! Lại đây Kuromi ôm một cái nào! Cuộc sống thỉnh thoảng có chút rắc rối, nhưng bạn là một bạn nhỏ rất dũng cảm và đáng yêu. Nói cho Kuromi nghe chuyện gì đã xảy ra nào, Kuromi luôn ở đây lắng nghe bạn!",
  },
];
