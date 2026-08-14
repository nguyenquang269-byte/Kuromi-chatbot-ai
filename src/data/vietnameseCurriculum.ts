import { VietnameseLearningData, MathLearningData } from "../types";

export interface VietnameseLetterItem {
  id: string;
  letter: string;
  lower: string;
  sound: string;
  isCompound?: boolean;
  compoundComponents?: string;
  strokeType: string;
  strokeGuide: string[];
  sampleWords: Array<{ word: string; emoji: string; meaning?: string }>;
  rhymePoem: string;
  fontHp001Note: string;
}

// 29 CHỮ CÁI TIẾNG VIỆT CHUẨN BỘ GIÁO DỤC (FONT HP001 4 HÀNG & TIỂU HỌC)
export const VIETNAMESE_29_LETTERS: VietnameseLetterItem[] = [
  {
    id: "vi_a",
    letter: "A",
    lower: "a",
    sound: "A",
    strokeType: "Nét cong kín và nét móc ngược",
    strokeGuide: [
      "Nét 1 (Nét cong kín): Đặt bút dưới đường kẻ 3 một chút, viết nét cong kín sang trái dừng tại điểm xuất phát (cao 2 ô ly).",
      "Nét 2 (Nét móc ngược): Đặt bút ở đường kẻ 3, rê bút sát bên phải nét cong kín, viết nét móc ngược dừng ở đường kẻ 2.",
    ],
    sampleWords: [
      { word: "Con Gà", emoji: "🐔", meaning: "Chú gà trống gáy vang" },
      { word: "Quả Na", emoji: "🍈", meaning: "Quả na ngọt thơm mắt to" },
      { word: "Cái Ca", emoji: "🥛", meaning: "Cái ca uống nước sạch" },
      { word: "Con Cá", emoji: "🐟", meaning: "Chú cá bơi lội dưới nước" },
    ],
    rhymePoem: "Cục ta cục tác, gà gáy vang lừng. Chữ a rộn rã, chào nắng tưng bừng!",
    fontHp001Note: "Font chuẩn HP001 4 hàng: Chữ a cao 2 ô ly, rộng 1.5 ô ly.",
  },
  {
    id: "vi_aw",
    letter: "Ă",
    lower: "ă",
    sound: "Á",
    strokeType: "Chữ a và dấu mũ trăng (nét cong dưới)",
    strokeGuide: [
      "Nét 1 & 2: Viết con chữ a như bình thường cao 2 ô ly.",
      "Nét 3 (Dấu trăng/dấu á): Đặt bút trên đầu chữ a (trên đường kẻ 3), viết nét cong lõm nhẹ xuống dưới tựa như vành trăng khuyết.",
    ],
    sampleWords: [
      { word: "Mặt Trăng", emoji: "🌙", meaning: "Trăng lưỡi liềm sáng tỏ" },
      { word: "Cái Khăn", emoji: "🧣", meaning: "Khăn quàng ấm áp ngày đông" },
      { word: "Con Rắn", emoji: "🐍", meaning: "Rắn trườn êm ru trong rừng" },
      { word: "Bắp Măng", emoji: "🎋", meaning: "Măng non nhú giữa luỹ tre" },
    ],
    rhymePoem: "Mặt trăng khuyết nhọn, đội mũ chữ a. Thành chữ ă đấy, cùng đọc nào ta!",
    fontHp001Note: "Font chuẩn HP001 4 hàng: Dấu trăng đặt cân đối trên đường kẻ 3.",
  },
  {
    id: "vi_aa",
    letter: "Â",
    lower: "â",
    sound: "Ớ",
    strokeType: "Chữ a và dấu mũ nón (nét xiên trái + xiên phải)",
    strokeGuide: [
      "Nét 1 & 2: Viết con chữ a như bình thường cao 2 ô ly.",
      "Nét 3 & 4 (Dấu nón): Đặt bút trên đường kẻ 3, viết nét xiên trái ngắn nối với nét xiên phải ngắn tạo thành chiếc nón úp nhọn xinh xắn.",
    ],
    sampleWords: [
      { word: "Cây Nấm", emoji: "🍄", meaning: "Cây nấm tí hon sau mưa" },
      { word: "Cây Cầu", emoji: "🌉", meaning: "Cây cầu nối đôi bờ sông" },
      { word: "Quả Mận", emoji: "🫐", meaning: "Mận chín đỏ mọng ngọt ngào" },
      { word: "Bồ Câu", emoji: "🕊️", meaning: "Chim bồ câu trắng hòa bình" },
    ],
    rhymePoem: "Chữ a đội nón, che nắng trưa hè. Thành chữ â nhỏ, tiếng chim ríu re!",
    fontHp001Note: "Font chuẩn HP001 4 hàng: Mũ nón nhọn đặt chính giữa đỉnh chữ a.",
  },
  {
    id: "vi_b",
    letter: "B",
    lower: "b",
    sound: "Bờ",
    strokeType: "Nét khuyết trên nối liền nét móc ngược và nét thắt",
    strokeGuide: [
      "Nét 1 (Nét khuyết trên): Đặt bút ở đường kẻ 2, đưa bút lên chạm đường kẻ 6 (cao 5 ô ly), lượn tròn sang trái rồi kéo thẳng xuống đường kẻ 1.",
      "Nét 2 (Nét móc ngược & thắt): Từ đường kẻ 1 rê bút lên đường kẻ 3, tạo nét thắt nhỏ dừng bút gần đường kẻ 3.",
    ],
    sampleWords: [
      { word: "Em Bé", emoji: "👶", meaning: "Em bé bụ bẫm tươi cười" },
      { word: "Con Bướm", emoji: "🦋", meaning: "Bướm lượn vườn hoa sặc sỡ" },
      { word: "Quả Bóng", emoji: "⚽", meaning: "Quả bóng tròn lăn trên sân" },
      { word: "Cái Bàn", emoji: "🪑", meaning: "Bàn học ngăn nắp của bé" },
    ],
    rhymePoem: "Chữ b dáng đứng hiên ngang, khuyết trên cao vút nhịp nhàng nét hoa!",
    fontHp001Note: "Font HP001 4 hàng: Thân chữ b cao 5 ô ly, nét thắt chạm đường kẻ 3.",
  },
  {
    id: "vi_c",
    letter: "C",
    lower: "c",
    sound: "Cờ",
    strokeType: "Nét cong hở phải",
    strokeGuide: [
      "Nét 1: Đặt bút dưới đường kẻ 3 một chút, viết nét cong sang trái, chạm đường kẻ 3, kéo cong xuống chạm đường kẻ 1, lượn lên dừng ở đường kẻ 2.",
    ],
    sampleWords: [
      { word: "Con Cá", emoji: "🐟", meaning: "Cá bơi tung tăng dưới nước" },
      { word: "Cây Cọ", emoji: "🌴", meaning: "Cây cọ xoè ô che nắng" },
      { word: "Cái Cốc", emoji: "🥤", meaning: "Cốc nước hoa quả ngọt lành" },
      { word: "Con Cua", emoji: "🦀", meaning: "Cua tám cẳng hai càng bò ngang" },
    ],
    rhymePoem: "Cong cong như nửa vầng trăng, là chữ c nhỏ bạn hằng mến yêu!",
    fontHp001Note: "Font HP001 4 hàng: Chữ c cao 2 ô ly, rộng 1.5 ô ly.",
  },
  {
    id: "vi_d",
    letter: "D",
    lower: "d",
    sound: "Dờ",
    strokeType: "Nét cong kín và nét móc ngược dài",
    strokeGuide: [
      "Nét 1: Viết nét cong kín cao 2 ô ly như chữ c ngược kín.",
      "Nét 2: Đặt bút ở đường kẻ 5 (cao 4 ô ly), kéo thẳng sát nét cong kín xuống đường kẻ 1 rồi móc lên dừng ở đường kẻ 2.",
    ],
    sampleWords: [
      { word: "Quả Dưa", emoji: "🍉", meaning: "Dưa hấu mát ngọt ngày hè" },
      { word: "Con Dê", emoji: "🐐", meaning: "Dê con kêu be be trên đồi" },
      { word: "Cái Dù", emoji: "☂️", meaning: "Dù che mưa che nắng" },
      { word: "Đôi Dép", emoji: "🩴", meaning: "Dép xinh nâng bước bé đi" },
    ],
    rhymePoem: "Nét cong nối với nét cao, chữ d xinh xắn vẫy chào bé ngoan!",
    fontHp001Note: "Font HP001 4 hàng: Chữ d cao 4 ô ly (tới dòng kẻ 5).",
  },
  {
    id: "vi_dd",
    letter: "Đ",
    lower: "đ",
    sound: "Đờ",
    strokeType: "Chữ d và nét gạch ngang ngắn",
    strokeGuide: [
      "Nét 1 & 2: Viết con chữ d như bình thường (cao 4 ô ly).",
      "Nét 3: Nhấc bút, lia bút lên đường kẻ 4, viết nét ngang ngắn (rộng 1 ô ly) cắt ngang thân chữ d.",
    ],
    sampleWords: [
      { word: "Quả Đu Đủ", emoji: "🥭", meaning: "Đu đủ chín vàng ngọt bùi" },
      { word: "Đèn Lồng", emoji: "🏮", meaning: "Đèn lồng lung linh đêm hội" },
      { word: "Đồng Hồ", emoji: "⏰", meaning: "Đồng hồ tích tắc đếm giờ" },
      { word: "Con Đò", emoji: "🛶", meaning: "Đò trôi êm ả trên sông" },
    ],
    rhymePoem: "Chữ d thêm gạch ngang đầu, thành chữ đ hát muôn câu rộn ràng!",
    fontHp001Note: "Font HP001 4 hàng: Nét ngang ngắn nằm chính xác trên đường kẻ 4.",
  },
  {
    id: "vi_e",
    letter: "E",
    lower: "e",
    sound: "E",
    strokeType: "Nét cong tròn kín lượn vòng sang cong hở phải",
    strokeGuide: [
      "Nét 1: Đặt bút trên đường kẻ 1 một chút, viết nét xiên lượn chéo lên đường kẻ 3 rồi lượn vòng sang trái tạo vòng tròn nhỏ, kéo cong xuống đường kẻ 1 và dừng ở giữa đường kẻ 1 và 2.",
    ],
    sampleWords: [
      { word: "Con Mèo", emoji: "🐱", meaning: "Mèo con meo meo bắt chuột" },
      { word: "Bé Khỏe", emoji: "💪", meaning: "Bé chăm tập thể dục khỏe mạnh" },
      { word: "Cái Xe", emoji: "🚗", meaning: "Xe chạy bon bon trên đường" },
      { word: "Em Bé", emoji: "👶", meaning: "Em bé ngây thơ đáng yêu" },
    ],
    rhymePoem: "Vòng xoay uyển chuyển dịu dàng, chữ e cất tiếng reo vang vui cười!",
    fontHp001Note: "Font HP001 4 hàng: Chữ e cao 2 ô ly, vòng thắt nằm ở 2/3 thân chữ.",
  },
  {
    id: "vi_ee",
    letter: "Ê",
    lower: "ê",
    sound: "Ê",
    strokeType: "Chữ e và dấu mũ nón",
    strokeGuide: [
      "Nét 1: Viết con chữ e cao 2 ô ly.",
      "Nét 2 & 3: Đặt bút trên đường kẻ 3, viết nét xiên trái ngắn nối với nét xiên phải ngắn tạo chiếc nón cân đối trên đỉnh chữ e.",
    ],
    sampleWords: [
      { word: "Búp Bê", emoji: "🪆", meaning: "Búp bê mặc váy hồng xinh" },
      { word: "Con Ếch", emoji: "🐸", meaning: "Ếch ngồi đáy giếng kêu ộp ộp" },
      { word: "Quả Khế", emoji: "⭐", meaning: "Khế năm cánh chín vàng ươm" },
      { word: "Cái Ghế", emoji: "🪑", meaning: "Ghế gỗ ngồi học thẳng lưng" },
    ],
    rhymePoem: "Chữ e đội nón thảnh thơi, thành chữ ê đấy bé ơi học liền!",
    fontHp001Note: "Font HP001 4 hàng: Mũ nón chữ ê cao 0.5 ô ly trên đường kẻ 3.",
  },
  {
    id: "vi_g",
    letter: "G",
    lower: "g",
    sound: "Gờ",
    strokeType: "Nét cong kín và nét khuyết dưới",
    strokeGuide: [
      "Nét 1: Viết nét cong kín cao 2 ô ly (từ đường kẻ 1 đến đường kẻ 3).",
      "Nét 2: Đặt bút từ đường kẻ 3, kéo thẳng xuống qua dòng kẻ 1 sâu xuống dưới 3 ô ly rồi lượn vòng sang trái tạo nét khuyết dưới, dừng bút ở đường kẻ 2.",
    ],
    sampleWords: [
      { word: "Con Gà", emoji: "🐔", meaning: "Gà mẹ dắt đàn con thơ" },
      { word: "Cái Gối", emoji: "🛌", meaning: "Gối êm ru bé ngủ ngon" },
      { word: "Gương Soi", emoji: "🪞", meaning: "Gương soi nụ cười rạng rỡ" },
      { word: "Củ Gừng", emoji: "🫚", meaning: "Gừng cay ấm áp mẹ nấu" },
    ],
    rhymePoem: "Khuyết dưới duyên dáng mềm mại, chữ g uốn lượn hăng say luyện bài!",
    fontHp001Note: "Font HP001 4 hàng: Chữ g cao 5 ô ly (2 ô ly trên, 3 ô ly dưới).",
  },
  {
    id: "vi_h",
    letter: "H",
    lower: "h",
    sound: "Hờ",
    strokeType: "Nét khuyết trên và nét móc hai đầu",
    strokeGuide: [
      "Nét 1: Viết nét khuyết trên cao 5 ô ly (chạm đường kẻ 6, kéo thẳng xuống đường kẻ 1).",
      "Nét 2: Từ đường kẻ 2 rê bút lên đường kẻ 3 viết nét móc hai đầu rộng 1.5 ô ly, dừng bút ở đường kẻ 2.",
    ],
    sampleWords: [
      { word: "Bông Hoa", emoji: "🌸", meaning: "Hoa đào khoe sắc mùa xuân" },
      { word: "Con Hổ", emoji: "🐯", meaning: "Hổ vằn dũng mãnh rừng xanh" },
      { word: "Học Bài", emoji: "📚", meaning: "Bé chăm học giỏi nghe lời" },
      { word: "Hộp Bút", emoji: "✏️", meaning: "Hộp bút chì màu xinh tươi" },
    ],
    rhymePoem: "Cột cờ cao vút khuyết trên, móc hai đầu nữa dựng nên chữ h!",
    fontHp001Note: "Font HP001 4 hàng: Nét khuyết trên cao 5 ô ly chuẩn mực.",
  },
  {
    id: "vi_i",
    letter: "I",
    lower: "i",
    sound: "I",
    strokeType: "Nét hất, nét móc ngược và dấu chấm",
    strokeGuide: [
      "Nét 1 (Nét hất): Đặt bút ở đường kẻ 2, viết nét hất lên đường kẻ 3.",
      "Nét 2 (Nét móc ngược): Kéo thẳng xuống đường kẻ 1 rồi móc lên dừng ở đường kẻ 2.",
      "Nét 3: Chấm nhẹ một điểm nhỏ trên đầu chữ i (trên đường kẻ 3).",
    ],
    sampleWords: [
      { word: "Hòn Bi", emoji: "🔮", meaning: "Bi ve tròn xoe đủ màu" },
      { word: "Con Khỉ", emoji: "🐒", meaning: "Khỉ con leo trèo thoăn thoắt" },
      { word: "Bút Chì", emoji: "✏️", meaning: "Bút chì viết chữ nắn nót" },
      { word: "Chim Yến", emoji: "🕊️", meaning: "Chim bay lượn giữa trời mây" },
    ],
    rhymePoem: "Chữ i có hạt ngọc xinh, chấm tròn trên trán lung linh đón chào!",
    fontHp001Note: "Font HP001 4 hàng: Thân chữ i cao 2 ô ly, dấu chấm nhỏ gọn.",
  },
  {
    id: "vi_k",
    letter: "K",
    lower: "k",
    sound: "Ca",
    strokeType: "Nét khuyết trên và nét móc thắt giữa",
    strokeGuide: [
      "Nét 1: Viết nét khuyết trên cao 5 ô ly dừng ở đường kẻ 1.",
      "Nét 2: Rê bút lên đường kẻ 2, viết nét móc xiên lên rồi thắt một vòng nhỏ ở giữa đường kẻ 2 và 3, đưa xiên xuống đường kẻ 1 móc lên dừng ở đường kẻ 2.",
    ],
    sampleWords: [
      { word: "Cái Kẹo", emoji: "🍬", meaning: "Kẹo mút ngọt ngào thơm lừng" },
      { word: "Cây Kéo", emoji: "✂️", meaning: "Kéo cắt giấy thủ công" },
      { word: "Kính Mắt", emoji: "👓", meaning: "Kính tròn nhìn rõ mọi vật" },
      { word: "Cái Kèn", emoji: "🎺", meaning: "Kèn thổi tò te vui tai" },
    ],
    rhymePoem: "Thân cao nét khuyết thẳng ngay, thắt lưng duyên dáng chữ k đây rồi!",
    fontHp001Note: "Font HP001 4 hàng: Thân chữ k cao 5 ô ly, nét thắt ở giữa cao 2 ô ly.",
  },
  {
    id: "vi_l",
    letter: "L",
    lower: "l",
    sound: "Lờ",
    strokeType: "Nét khuyết trên nối liền nét móc ngược",
    strokeGuide: [
      "Nét 1: Đặt bút ở đường kẻ 2, viết nét khuyết trên vươn lên đường kẻ 6 (cao 5 ô ly), kéo thẳng xuống đường kẻ 1 lượn tròn móc ngược lên dừng ở đường kẻ 2.",
    ],
    sampleWords: [
      { word: "Con Lợn", emoji: "🐷", meaning: "Lợn con ủn ỉn béo tròn" },
      { word: "Hoa Lan", emoji: "🌺", meaning: "Lan rừng ngát hương thơm" },
      { word: "Lá Cây", emoji: "🍃", meaning: "Lá xanh đu đưa trong gió" },
      { word: "Quả Lê", emoji: "🍐", meaning: "Lê ngọt giòn tan mọng nước" },
    ],
    rhymePoem: "Chữ l vút tận trời mây, chân móc cong nhẹ tháng ngày vươn xa!",
    fontHp001Note: "Font HP001 4 hàng: Chiều cao chữ l đúng 5 ô ly, chân rộng 1 ô ly.",
  },
  {
    id: "vi_m",
    letter: "M",
    lower: "m",
    sound: "Mờ",
    strokeType: "Hai nét móc xuôi và một nét móc hai đầu",
    strokeGuide: [
      "Nét 1: Đặt bút giữa đường kẻ 2 và 3, viết nét móc xuôi cao 2 ô ly.",
      "Nét 2: Rê bút lên đường kẻ 2 viết nét móc xuôi thứ hai rộng 1.5 ô ly.",
      "Nét 3: Rê bút lên đường kẻ 2 viết nét móc hai đầu, dừng bút ở đường kẻ 2.",
    ],
    sampleWords: [
      { word: "Con Mèo", emoji: "🐱", meaning: "Mèo mun lông mượt sưởi nắng" },
      { word: "Mặt Trời", emoji: "☀️", meaning: "Mặt trời toả nắng ban mai" },
      { word: "Mũ Len", emoji: "🧢", meaning: "Mũ len ấm áp đội đầu" },
      { word: "Mẹ Hiền", emoji: "👩‍👧", meaning: "Mẹ yêu thương chăm sóc bé" },
    ],
    rhymePoem: "Ba nhịp móc uốn thẳng hàng, chữ m ba nhịp rộn ràng nét hoa!",
    fontHp001Note: "Font HP001 4 hàng: Chữ m cao 2 ô ly, bề rộng chuẩn 5 ô ly.",
  },
  {
    id: "vi_n",
    letter: "N",
    lower: "n",
    sound: "Nờ",
    strokeType: "Một nét móc xuôi và một nét móc hai đầu",
    strokeGuide: [
      "Nét 1: Đặt bút giữa đường kẻ 2 và 3, viết nét móc xuôi dừng ở đường kẻ 1.",
      "Nét 2: Rê bút lên đường kẻ 2 viết nét móc hai đầu, dừng bút ở đường kẻ 2.",
    ],
    sampleWords: [
      { word: "Con Nai", emoji: "🦌", meaning: "Nai vàng ngơ ngác ngắm rừng" },
      { word: "Quả Na", emoji: "🍈", meaning: "Na mở mắt thơm lừng vườn" },
      { word: "Ngôi Nhà", emoji: "🏠", meaning: "Mái nhà ấm cúng yêu thương" },
      { word: "Nơ Hồng", emoji: "🎀", meaning: "Chiếc nơ Kuromi cài áo" },
    ],
    rhymePoem: "Hai nhịp móc bước nhịp nhàng, chữ n xinh xắn thẳng hàng bé ơi!",
    fontHp001Note: "Font HP001 4 hàng: Chữ n cao 2 ô ly, rộng 3.5 ô ly.",
  },
  {
    id: "vi_o",
    letter: "O",
    lower: "o",
    sound: "O",
    strokeType: "Nét cong kín",
    strokeGuide: [
      "Nét 1: Đặt bút dưới đường kẻ 3 một chút, viết nét cong kín sang trái, lưng cong chạm đường kẻ 1 rồi lượn lên chạm điểm xuất phát (cao 2 ô ly, rộng 1.5 ô ly).",
    ],
    sampleWords: [
      { word: "Con Ong", emoji: "🐝", meaning: "Ong chăm chỉ đi tìm mật" },
      { word: "Con Bò", emoji: "🐮", meaning: "Bò sữa gặm cỏ trên đồng" },
      { word: "Quả Ổi", emoji: "🍈", meaning: "Ổi giòn ngọt ngào vị quê" },
      { word: "Quả Trứng", emoji: "🥚", meaning: "Trứng tròn xoe trong ổ rơm" },
    ],
    rhymePoem: "O tròn như quả trứng gà, tròn xoe nét chữ nhà nhà đều khen!",
    fontHp001Note: "Font HP001 4 hàng: O tròn chuẩn nét đều, cao 2 ô ly, rộng 1.5 ô ly.",
  },
  {
    id: "vi_oo",
    letter: "Ô",
    lower: "ô",
    sound: "Ô",
    strokeType: "Chữ o và dấu mũ nón",
    strokeGuide: [
      "Nét 1: Viết chữ o tròn xoe cao 2 ô ly.",
      "Nét 2 & 3: Đặt dấu mũ nón cân đối chính giữa trên đầu chữ o (trên đường kẻ 3).",
    ],
    sampleWords: [
      { word: "Cái Ô", emoji: "☂️", meaning: "Ô che mưa nắng trên đường" },
      { word: "Con Hổ", emoji: "🐯", meaning: "Hổ chúa sơn lâm oai phong" },
      { word: "Đồng Hồ", emoji: "⏰", meaning: "Đồng hồ chuông reo thức dậy" },
      { word: "Củ Cà Rốt", emoji: "🥕", meaning: "Cà rốt đỏ cam cho thỏ" },
    ],
    rhymePoem: "Ô thì đội chiếc nón xinh, cùng o dạo phố lung linh nắng vàng!",
    fontHp001Note: "Font HP001 4 hàng: Dấu nón chữ ô nhọn góc 90 độ, cao 0.5 ô ly.",
  },
  {
    id: "vi_ow",
    letter: "Ơ",
    lower: "ơ",
    sound: "Ơ",
    strokeType: "Chữ o và dấu râu (nét râu nhỏ)",
    strokeGuide: [
      "Nét 1: Viết con chữ o cao 2 ô ly.",
      "Nét 2 (Dấu râu): Đặt bút ở đường kẻ 3 bên phải đỉnh chữ o, viết nét râu nhỏ cong nhẹ lên trên.",
    ],
    sampleWords: [
      { word: "Quả Bơ", emoji: "🥑", meaning: "Bơ dẻo thơm béo ngậy" },
      { word: "Lá Cờ", emoji: "🚩", meaning: "Cờ đỏ sao vàng tung bay" },
      { word: "Cái Nơ", emoji: "🎀", meaning: "Nơ bướm gắn trên tóc em" },
      { word: "Con Ốc", emoji: "🐚", meaning: "Ốc nhỏ mang nhà đi dạo" },
    ],
    rhymePoem: "Ơ thì thêm một chiếc râu, xinh tươi duyên dáng hàng đầu bảng hoa!",
    fontHp001Note: "Font HP001 4 hàng: Dấu râu chữ ơ nhỏ nhắn tựa vào góc 1 giờ.",
  },
  {
    id: "vi_p",
    letter: "P",
    lower: "p",
    sound: "Pờ",
    strokeType: "Nét hất, nét thẳng đứng và nét móc hai đầu",
    strokeGuide: [
      "Nét 1: Đặt bút ở đường kẻ 2, viết nét hất lên đường kẻ 3.",
      "Nét 2: Kéo thẳng đứng xuống dưới dòng kẻ 1 sâu 2 ô ly (tổng dài 4 ô ly).",
      "Nét 3: Rê bút lên đường kẻ 2 viết nét móc hai đầu dừng ở đường kẻ 2.",
    ],
    sampleWords: [
      { word: "Đèn Pin", emoji: "🔦", meaning: "Đèn pin soi sáng trong đêm" },
      { word: "Cây Phượng", emoji: "🌺", meaning: "Hoa phượng vĩ đỏ rực hè" },
      { word: "Pháo Hoa", emoji: "🎆", meaning: "Pháo hoa nở rộ đêm giao thừa" },
      { word: "Cây Bút", emoji: "🖊️", meaning: "Bút viết nắn nót từng trang" },
    ],
    rhymePoem: "Chân dài chạm đáy dòng ba, đầu tròn nét móc chữ p đây rồi!",
    fontHp001Note: "Font HP001 4 hàng: Chữ p cao 4 ô ly (2 ô ly trên, 2 ô ly dưới).",
  },
  {
    id: "vi_q",
    letter: "Q",
    lower: "q",
    sound: "Quy",
    strokeType: "Nét cong kín và nét thẳng đứng dài",
    strokeGuide: [
      "Nét 1: Viết nét cong kín cao 2 ô ly (từ đường kẻ 1 đến 3).",
      "Nét 2: Đặt bút ở đường kẻ 3 sát nét cong kín, kéo thẳng xuống dưới dòng kẻ 1 sâu 2 ô ly (tổng cao 4 ô ly).",
    ],
    sampleWords: [
      { word: "Quả Quýt", emoji: "🍊", meaning: "Quýt mọng nước chua ngọt" },
      { word: "Con Quạ", emoji: "🦅", meaning: "Quạ thông minh gắp sỏi" },
      { word: "Cái Quạt", emoji: "🪭", meaning: "Quạt nan phe phẩy gió mát" },
      { word: "Quyển Sách", emoji: "📖", meaning: "Sách mở ra bao điều hay" },
    ],
    rhymePoem: "Tròn tròn đứng cạnh thân dài, chữ q thẳng tắp miệt mài học chăm!",
    fontHp001Note: "Font HP001 4 hàng: Nét sổ thẳng của q kéo sâu 2 ô ly dưới dòng kẻ 1.",
  },
  {
    id: "vi_r",
    letter: "R",
    lower: "r",
    sound: "Rờ",
    strokeType: "Nét thắt trên và nét móc ngược rộng",
    strokeGuide: [
      "Nét 1: Đặt bút ở đường kẻ 1, viết nét xiên lên đường kẻ 3, lượn xoắn thắt nhỏ nhô cao hơn đường kẻ 3 một chút rồi đưa ngang sang phải, kéo cong xuống đường kẻ 1 móc lên dừng ở đường kẻ 2.",
    ],
    sampleWords: [
      { word: "Con Rùa", emoji: "🐢", meaning: "Rùa chậm chạp nhưng kiên trì" },
      { word: "Con Rắn", emoji: "🐍", meaning: "Rắn trườn uốn lượn nhịp nhàng" },
      { word: "Rau Xanh", emoji: "🥬", meaning: "Rau tươi mẹ hái vườn nhà" },
      { word: "Rừng Cây", emoji: "🌲", meaning: "Rừng xanh che bóng muôn loài" },
    ],
    rhymePoem: "Nét thắt uốn lượn đầu r, bước đi uyển chuyển chẳng lo ngã nhào!",
    fontHp001Note: "Font HP001 4 hàng: Thắt đầu chữ r cao 2.25 ô ly (nhô qua đường kẻ 3).",
  },
  {
    id: "vi_s",
    letter: "S",
    lower: "s",
    sound: "Sờ (Uốn lưỡi)",
    strokeType: "Nét thắt trên và nét cong hở trái",
    strokeGuide: [
      "Nét 1: Đặt bút ở đường kẻ 1, viết nét xiên lên qua đường kẻ 3, lượn tạo nét xoắn thắt nhỏ rồi lượn cong sang phải xuống đường kẻ 1 lượn vào trong dừng bút trên đường kẻ 1.",
    ],
    sampleWords: [
      { word: "Con Sóc", emoji: "🐿️", meaning: "Sóc nhảy nhót nhặt hạt dẻ" },
      { word: "Sách Vở", emoji: "📖", meaning: "Sách vở thơm mùi giấy mới" },
      { word: "Hoa Sen", emoji: "🪷", meaning: "Sen hồng ngát hương bùn lầy" },
      { word: "Ngôi Sao", emoji: "⭐", meaning: "Sao lấp lánh trên trời cao" },
    ],
    rhymePoem: "Cong cong bụng bự dễ thương, chữ s uốn lưỡi thân thương bạn bè!",
    fontHp001Note: "Font HP001 4 hàng: Thân chữ s phình cong rộng 1.5 ô ly.",
  },
  {
    id: "vi_t",
    letter: "T",
    lower: "t",
    sound: "Tờ",
    strokeType: "Nét hất, nét móc ngược dài và nét gạch ngang",
    strokeGuide: [
      "Nét 1: Đặt bút ở đường kẻ 2, viết nét hất lên đường kẻ 3.",
      "Nét 2: Đặt bút ở đường kẻ 4 (cao 3 ô ly), kéo thẳng xuống đường kẻ 1 rồi móc ngược lên dừng ở đường kẻ 2.",
      "Nét 3: Viết nét ngang ngắn trên đường kẻ 3 cắt ngang thân chữ.",
    ],
    sampleWords: [
      { word: "Con Tôm", emoji: "🦐", meaning: "Tôm búng càng tanh tách" },
      { word: "Cái Tủ", emoji: "🚪", meaning: "Tủ quần áo xếp gọn gàng" },
      { word: "Quả Táo", emoji: "🍎", meaning: "Táo đỏ giòn ngọt thơm ngon" },
      { word: "Trái Tim", emoji: "❤️", meaning: "Trái tim yêu thương chan hoà" },
    ],
    rhymePoem: "Chữ t cao ba ô ly, ngang thân một gạch bước đi rộn ràng!",
    fontHp001Note: "Font HP001 4 hàng: Chiều cao chữ t chuẩn 3 ô ly (tới đường kẻ 4).",
  },
  {
    id: "vi_u",
    letter: "U",
    lower: "u",
    sound: "U",
    strokeType: "Nét hất, nét móc ngược rộng và nét móc ngược",
    strokeGuide: [
      "Nét 1: Đặt bút ở đường kẻ 2 viết nét hất lên đường kẻ 3.",
      "Nét 2: Kéo thẳng xuống đường kẻ 1 lượn tròn lên đường kẻ 3 (rộng 1.5 ô ly).",
      "Nét 3: Từ đường kẻ 3 kéo thẳng sát xuống đường kẻ 1 móc lên dừng ở đường kẻ 2.",
    ],
    sampleWords: [
      { word: "Cái Mũ", emoji: "🧢", meaning: "Mũ che nắng xinh tươi" },
      { word: "Đu Đủ", emoji: "🥭", meaning: "Đu đủ chín ngọt bùi" },
      { word: "Con Cú", emoji: "🦉", meaning: "Cú mèo tinh anh trong đêm" },
      { word: "Củ Từ", emoji: "🥔", meaning: "Củ từ mẹ luộc thơm bùi" },
    ],
    rhymePoem: "Chữ u đáy võng đung đưa, ru câu cổ tích ngày xưa ngọt ngào!",
    fontHp001Note: "Font HP001 4 hàng: Chữ u cao 2 ô ly, đáy cong chạm đường kẻ 1.",
  },
  {
    id: "vi_uw",
    letter: "Ư",
    lower: "ư",
    sound: "Ư",
    strokeType: "Chữ u và dấu râu nhỏ",
    strokeGuide: [
      "Nét 1, 2, 3: Viết chữ u cao 2 ô ly.",
      "Nét 4 (Dấu râu): Đặt bút bên phải đỉnh nét móc thứ hai (trên đường kẻ 3), viết nét râu nhỏ cong lên.",
    ],
    sampleWords: [
      { word: "Con Bướm", emoji: "🦋", meaning: "Bướm vờn cánh hoa rực rỡ" },
      { word: "Cây Mướp", emoji: "🥒", meaning: "Mướp hương hoa vàng trĩu giàn" },
      { word: "Bức Thư", emoji: "💌", meaning: "Thư gửi thăm bạn phương xa" },
      { word: "Sư Tử", emoji: "🦁", meaning: "Sư tử dũng mãnh bờm vàng" },
    ],
    rhymePoem: "Chữ u thêm một nét râu, hoá thành chữ ư muôn màu ngát hương!",
    fontHp001Note: "Font HP001 4 hàng: Dấu râu chữ ư nhỏ gọn đặt tại góc trên bên phải.",
  },
  {
    id: "vi_v",
    letter: "V",
    lower: "v",
    sound: "Vờ",
    strokeType: "Nét móc xuôi nối liền nét móc ngược và nét thắt",
    strokeGuide: [
      "Nét 1: Đặt bút giữa đường kẻ 2 và 3, viết nét móc xuôi rồi lượn xuống đường kẻ 1, lượn cong lên đường kẻ 3 tạo nét thắt nhỏ dừng bút gần đường kẻ 3.",
    ],
    sampleWords: [
      { word: "Con Vịt", emoji: "🦆", meaning: "Vịt bầu bơi lội cạp cạp" },
      { word: "Con Voi", emoji: "🐘", meaning: "Voi con ngoan ngoãn vẫy vòi" },
      { word: "Vở Vẽ", emoji: "🎨", meaning: "Vở vẽ tranh rực rỡ sắc màu" },
      { word: "Vườn Cây", emoji: "🌳", meaning: "Vườn cây râm mát trưa hè" },
    ],
    rhymePoem: "Uốn lượn thắt nút bên trên, chữ v duyên dáng khắc tên bảng vàng!",
    fontHp001Note: "Font HP001 4 hàng: Chữ v cao 2 ô ly, thắt nhỏ tại đường kẻ 3.",
  },
  {
    id: "vi_x",
    letter: "X",
    lower: "x",
    sound: "Xờ (Nhẹ)",
    strokeType: "Nét cong hở phải ghép lưng nét cong hở trái",
    strokeGuide: [
      "Nét 1: Đặt bút dưới đường kẻ 3, viết nét cong hở phải dừng ở đường kẻ 1.",
      "Nét 2: Đặt bút dưới đường kẻ 3, viết nét cong hở trái lưng tựa sát vào nét cong thứ nhất, dừng bút ở đường kẻ 1.",
    ],
    sampleWords: [
      { word: "Xe Đạp", emoji: "🚲", meaning: "Xe đạp cọc cạch bon bon" },
      { word: "Quả Xoài", emoji: "🥭", meaning: "Xoài cát chín vàng ngọt lịm" },
      { word: "Xúc Xích", emoji: "🌭", meaning: "Món xúc xích thơm lừng bé mê" },
      { word: "Xích Đu", emoji: "🎪", meaning: "Xích đu bay bổng công viên" },
    ],
    rhymePoem: "Hai nửa vầng trăng tựa lưng, chữ x xinh xắn tưng bừng vui ca!",
    fontHp001Note: "Font HP001 4 hàng: Chữ x cao 2 ô ly, rộng 3 ô ly.",
  },
  {
    id: "vi_y",
    letter: "Y",
    lower: "y",
    sound: "Y dài",
    strokeType: "Nét hất, nét móc ngược và nét khuyết dưới dài",
    strokeGuide: [
      "Nét 1: Đặt bút ở đường kẻ 2, viết nét hất lên đường kẻ 3.",
      "Nét 2: Kéo thẳng xuống đường kẻ 1 lượn tròn lên đường kẻ 3 (như nửa đầu chữ u).",
      "Nét 3: Từ đường kẻ 3 kéo thẳng xuống sâu 3 ô ly dưới dòng kẻ 1 lượn nét khuyết dưới, dừng bút ở đường kẻ 2.",
    ],
    sampleWords: [
      { word: "Bác Sĩ Y Tá", emoji: "🩺", meaning: "Y tá chăm sóc ân cần" },
      { word: "Cái Yếm", emoji: "🎽", meaning: "Yếm dãi xinh xắn của bé" },
      { word: "Chim Yến", emoji: "🕊️", meaning: "Tổ yến bổ dưỡng thơm ngon" },
      { word: "Ý Nghĩ", emoji: "💡", meaning: "Ý tưởng sáng tạo tuyệt vời" },
    ],
    rhymePoem: "Chữ y duyên dáng thân dài, khuyết sâu ba nhịp miệt mài luyện trang!",
    fontHp001Note: "Font HP001 4 hàng: Chữ y cao 5 ô ly (2 ô ly trên, 3 ô ly dưới).",
  },
];

// 11 CHỮ GHÉP TIẾNG VIỆT CHUẨN TIỂU HỌC (8 CHỮ GHÉP CƠ BẢN + CHỮ GHÉP MỞ RỘNG)
export const VIETNAMESE_COMPOUND_LETTERS: VietnameseLetterItem[] = [
  {
    id: "vi_ch",
    letter: "CH",
    lower: "ch",
    sound: "Chờ (chờ nhẹ)",
    isCompound: true,
    compoundComponents: "c + h",
    strokeType: "Ghép âm c (cao 2 ô ly) nối liền âm h (cao 5 ô ly)",
    strokeGuide: [
      "Nét 1: Viết chữ c cao 2 ô ly, từ điểm dừng bút rê bút liền mạch lên đường kẻ 6.",
      "Nét 2: Viết nét khuyết trên và nét móc hai đầu của chữ h cao 5 ô ly.",
    ],
    sampleWords: [
      { word: "Chú Chim", emoji: "🐦", meaning: "Chim hót líu lo trên cành" },
      { word: "Chó Con", emoji: "🐶", meaning: "Cún con ngoe nguẩy đuôi mừng" },
      { word: "Cái Chổi", emoji: "🧹", meaning: "Chổi quét nhà sạch bong" },
      { word: "Quả Chanh", emoji: "🍋", meaning: "Chanh mọng nước chua thanh" },
    ],
    rhymePoem: "Chữ c nắm tay chữ h, thành âm ch ríu rít hót vang cành chanh!",
    fontHp001Note: "Font HP001 4 hàng: Điểm nối c sang h liền mạch mượt mà.",
  },
  {
    id: "vi_gh",
    letter: "GH",
    lower: "gh",
    sound: "Gờ (ghép với e, ê, i)",
    isCompound: true,
    compoundComponents: "g + h",
    strokeType: "Ghép âm g (cao 5 ô ly) nối nét móc lên chữ h (cao 5 ô ly)",
    strokeGuide: [
      "Nét 1: Viết chữ g cao 5 ô ly (2 ô ly trên, 3 ô ly dưới).",
      "Nét 2: Từ nét khuyết dưới đưa xiên lên đường kẻ 6 để nối vào chữ h.",
    ],
    sampleWords: [
      { word: "Cái Ghế", emoji: "🪑", meaning: "Ghế gỗ ngồi học nghiêm trang" },
      { word: "Ghi Nhớ", emoji: "📝", meaning: "Ghi nhớ bài học cô dạy" },
      { word: "Con Ghẹ", emoji: "🦀", meaning: "Ghẹ biển nhiều gạch thơm ngon" },
      { word: "Ghé Thăm", emoji: "🏡", meaning: "Ghé thăm ông bà cuối tuần" },
    ],
    rhymePoem: "Gh đi với e, ê, i; ghi bài nắn nót nhớ ghi trong lòng!",
    fontHp001Note: "Font HP001 4 hàng: Hai chữ g và h đều cao 5 ô ly cân đối.",
  },
  {
    id: "vi_gi",
    letter: "GI",
    lower: "gi",
    sound: "Giờ (gió, giày, giường)",
    isCompound: true,
    compoundComponents: "g + i",
    strokeType: "Ghép âm g (cao 5 ô ly) nối liền âm i (cao 2 ô ly)",
    strokeGuide: [
      "Nét 1: Viết chữ g hoàn chỉnh với nét khuyết dưới.",
      "Nét 2: Từ điểm dừng chữ g đưa bút lên đường kẻ 3 nối vào thân chữ i.",
    ],
    sampleWords: [
      { word: "Cơn Gió", emoji: "🌬️", meaning: "Gió mát thổi bay diều biếc" },
      { word: "Đôi Giày", emoji: "👟", meaning: "Giày xinh đi bộ thể thao" },
      { word: "Chiếc Giường", emoji: "🛏️", meaning: "Giường ngủ êm ái thơm tho" },
      { word: "Hạt Gạo", emoji: "🌾", meaning: "Hạt gạo trắng ngần dẻo thơm" },
    ],
    rhymePoem: "Gió thổi bay chiếc giày xinh, âm gi nhẹ bước tự tình sớm mai!",
    fontHp001Note: "Font HP001 4 hàng: Dấu chấm i đặt trên đường kẻ 3 sau khi ghép.",
  },
  {
    id: "vi_kh",
    letter: "KH",
    lower: "kh",
    sound: "Khờ (khỉ, khế, khăn)",
    isCompound: true,
    compoundComponents: "k + h",
    strokeType: "Ghép âm k (cao 5 ô ly) nối liền âm h (cao 5 ô ly)",
    strokeGuide: [
      "Nét 1: Viết chữ k cao 5 ô ly với nét thắt duyên dáng.",
      "Nét 2: Từ điểm dừng của k lượn nét hất lên đường kẻ 6 nối tiếp chữ h.",
    ],
    sampleWords: [
      { word: "Con Khỉ", emoji: "🐒", meaning: "Khỉ con leo cành thoăn thoắt" },
      { word: "Quả Khế", emoji: "⭐", meaning: "Khế năm cánh thơm ngọt lịm" },
      { word: "Cái Khăn", emoji: "🧣", meaning: "Khăn ấm quàng cổ ngày đông" },
      { word: "Khủng Long", emoji: "🦖", meaning: "Khủng long bạo chúa khổng lồ" },
    ],
    rhymePoem: "K với h sánh đôi liền, khỉ con hái khế dịu hiền dâng mẹ!",
    fontHp001Note: "Font HP001 4 hàng: Hai đỉnh khuyết trên chạm đường kẻ 6.",
  },
  {
    id: "vi_nh",
    letter: "NH",
    lower: "nh",
    sound: "Nhờ (nhà, nhím, nho)",
    isCompound: true,
    compoundComponents: "n + h",
    strokeType: "Ghép âm n (cao 2 ô ly) nối liền âm h (cao 5 ô ly)",
    strokeGuide: [
      "Nét 1: Viết chữ n cao 2 ô ly với hai nhịp móc.",
      "Nét 2: Từ điểm dừng của n đưa bút vươn lên đường kẻ 6 nối tiếp chữ h.",
    ],
    sampleWords: [
      { word: "Ngôi Nhà", emoji: "🏠", meaning: "Mái ấm gia đình rộn tiếng cười" },
      { word: "Con Nhím", emoji: "🦔", meaning: "Nhím xù gai nhọn bảo vệ mình" },
      { word: "Chùm Nho", emoji: "🍇", meaning: "Nho tím mọng nước ngọt thanh" },
      { word: "Nhành Hoa", emoji: "🌸", meaning: "Cành hoa tươi thắm đón xuân" },
    ],
    rhymePoem: "N bé nhỏ h vươn cao, chữ nh ấm áp đón chào bé ngoan!",
    fontHp001Note: "Font HP001 4 hàng: Chữ n cao 2 ô ly, chữ h cao 5 ô ly chuẩn mực.",
  },
  {
    id: "vi_ng",
    letter: "NG",
    lower: "ng",
    sound: "Ngờ (ngựa, ngô, ngao)",
    isCompound: true,
    compoundComponents: "n + g",
    strokeType: "Ghép âm n (cao 2 ô ly) nối liền âm g (cao 5 ô ly)",
    strokeGuide: [
      "Nét 1: Viết chữ n cao 2 ô ly.",
      "Nét 2: Nhấc bút lia sang viết chữ g có nét khuyết dưới sâu 3 ô ly.",
    ],
    sampleWords: [
      { word: "Con Ngựa", emoji: "🐴", meaning: "Ngựa phi nước đại dặm trường" },
      { word: "Bắp Ngô", emoji: "🌽", meaning: "Ngô ngọt luộc nóng thơm phức" },
      { word: "Con Ngao", emoji: "🦪", meaning: "Ngao biển nấu canh chua mát" },
      { word: "Thiên Nga", emoji: "🦢", meaning: "Thiên nga trắng bơi lội hồ" },
    ],
    rhymePoem: "Bắp ngô vàng rực đồng xa, chữ ng rộn rã câu ca thanh bình!",
    fontHp001Note: "Font HP001 4 hàng: Khoảng cách giữa n và g cách 0.5 ô ly.",
  },
  {
    id: "vi_ngh",
    letter: "NGH",
    lower: "ngh",
    sound: "Ngờ (nghép với e, ê, i)",
    isCompound: true,
    compoundComponents: "n + g + h",
    strokeType: "Chữ ghép 3 âm: n (2 ô ly) + g (5 ô ly) + h (5 ô ly)",
    strokeGuide: [
      "Nét 1: Viết chữ n cao 2 ô ly.",
      "Nét 2: Viết chữ g cao 5 ô ly.",
      "Nét 3: Từ nét khuyết dưới chữ g đưa bút vươn lên đường kẻ 6 viết chữ h.",
    ],
    sampleWords: [
      { word: "Con Nghé", emoji: "🐃", meaning: "Nghé con gặm cỏ bờ đê" },
      { word: "Lắng Nghe", emoji: "👂", meaning: "Lắng nghe lời thầy cô giảng" },
      { word: "Nghỉ Hè", emoji: "🏖️", meaning: "Nghỉ hè tắm biển vui chơi" },
      { word: "Nghiêng Nghiêng", emoji: "📐", meaning: "Nét bút nghiêng nghiêng đẹp xinh" },
    ],
    rhymePoem: "N, g rồi đến chữ h; tạo thành ngh đấy chẳng hề khó khăn!",
    fontHp001Note: "Font HP001 4 hàng: Chữ ghép ba âm n-g-h chuẩn tỷ lệ liền mạch.",
  },
  {
    id: "vi_ph",
    letter: "PH",
    lower: "ph",
    sound: "Phờ (phở, phượng, pháo)",
    isCompound: true,
    compoundComponents: "p + h",
    strokeType: "Ghép âm p (cao 4 ô ly) nối liền âm h (cao 5 ô ly)",
    strokeGuide: [
      "Nét 1: Viết chữ p cao 4 ô ly (2 ô ly trên, 2 ô ly dưới).",
      "Nét 2: Từ nét móc hai đầu của p rê bút lên đường kẻ 6 nối vào chữ h.",
    ],
    sampleWords: [
      { word: "Pháo Hoa", emoji: "🎆", meaning: "Pháo hoa rực rỡ trời đêm" },
      { word: "Bát Phở", emoji: "🍜", meaning: "Bát phở bò nóng hổi thơm ngon" },
      { word: "Hoa Phượng", emoji: "🌺", meaning: "Hoa phượng thắp lửa đón hè" },
      { word: "Cây Phong", emoji: "🍁", meaning: "Lá phong đỏ rực mùa thu" },
    ],
    rhymePoem: "Pháo hoa thắp sáng trời hồng, chữ ph rộn rã ấm lòng bạn thơ!",
    fontHp001Note: "Font HP001 4 hàng: Điểm nối từ p sang h tại đường kẻ 2.",
  },
  {
    id: "vi_th",
    letter: "TH",
    lower: "th",
    sound: "Thờ (thỏ, thuyền, thước)",
    isCompound: true,
    compoundComponents: "t + h",
    strokeType: "Ghép âm t (cao 3 ô ly) nối liền âm h (cao 5 ô ly)",
    strokeGuide: [
      "Nét 1: Viết thân chữ t cao 3 ô ly, từ nét móc ngược đưa bút lên đường kẻ 6.",
      "Nét 2: Viết chữ h cao 5 ô ly hoàn chỉnh.",
      "Nét 3: Đặt nét gạch ngang ngắn trên đường kẻ 3 của chữ t.",
    ],
    sampleWords: [
      { word: "Con Thỏ", emoji: "🐰", meaning: "Thỏ trắng tai dài mắt hồng" },
      { word: "Cây Thước", emoji: "📏", meaning: "Thước kẻ kẻ đường thẳng tắp" },
      { word: "Con Thuyền", emoji: "⛵", meaning: "Thuyền buồm lướt sóng ra khơi" },
      { word: "Quả Thị", emoji: "🟡", meaning: "Thị thơm cô Tấm bước ra" },
    ],
    rhymePoem: "Thỏ con tai vểnh trắng ngần, chữ th nắn nót bước gần bé vui!",
    fontHp001Note: "Font HP001 4 hàng: Thân t cao 3 ô ly nối mượt với h cao 5 ô ly.",
  },
  {
    id: "vi_tr",
    letter: "TR",
    lower: "tr",
    sound: "Trờ (trờ nặng uốn lưỡi: trăng, tre, trời)",
    isCompound: true,
    compoundComponents: "t + r",
    strokeType: "Ghép âm t (cao 3 ô ly) nối liền âm r (cao 2.25 ô ly)",
    strokeGuide: [
      "Nét 1: Viết thân chữ t cao 3 ô ly.",
      "Nét 2: Từ nét móc ngược đưa xiên lên nối tiếp nét thắt đầu của chữ r.",
      "Nét 3: Gạch ngang ngắn chữ t trên đường kẻ 3.",
    ],
    sampleWords: [
      { word: "Mặt Trăng", emoji: "🌙", meaning: "Trăng tròn vằng vặc đêm rằm" },
      { word: "Cây Tre", emoji: "🎋", meaning: "Luỹ tre xanh mát đầu làng" },
      { word: "Bầu Trời", emoji: "🌌", meaning: "Trời xanh bao la mây trắng" },
      { word: "Quả Trứng", emoji: "🥚", meaning: "Trứng tròn mẹ luộc cho bé" },
    ],
    rhymePoem: "Mặt trăng toả sáng đêm rằm, chữ tr uốn lưỡi nhớ nằm lòng nghe!",
    fontHp001Note: "Font HP001 4 hàng: Chữ t cao 3 ô ly, r cao 2.25 ô ly.",
  },
  {
    id: "vi_qu",
    letter: "QU",
    lower: "qu",
    sound: "Quy (quạt, quả, quà)",
    isCompound: true,
    compoundComponents: "q + u",
    strokeType: "Ghép âm q (cao 4 ô ly) nối liền âm u (cao 2 ô ly)",
    strokeGuide: [
      "Nét 1: Viết chữ q có nét thẳng sâu 2 ô ly dưới dòng kẻ 1.",
      "Nét 2: Lia bút sang đường kẻ 2 viết chữ u cao 2 ô ly.",
    ],
    sampleWords: [
      { word: "Quả Quýt", emoji: "🍊", meaning: "Quýt mọng nước thơm ngọt" },
      { word: "Cái Quạt", emoji: "🪭", meaning: "Quạt xoè đón ngọn gió lành" },
      { word: "Hộp Quà", emoji: "🎁", meaning: "Quà sinh nhật Kuromi tặng" },
      { word: "Quần Áo", emoji: "👕", meaning: "Quần áo sạch sẽ tinh tươm" },
    ],
    rhymePoem: "Quạt mát trưa hè êm ru, chữ qu bé đọc lời ru ngọt lành!",
    fontHp001Note: "Font HP001 4 hàng: Khoảng cách q và u chuẩn 0.5 ô ly.",
  },
];

// TOÀN BỘ BẢNG CỬU CHƯƠNG & BẢNG TÍNH TIỂU HỌC (+, -, ×, ÷)
export const MATH_ADDITION_TABLES = Array.from({ length: 9 }, (_, i) => {
  const base = i + 1;
  return {
    num: base,
    title: `Bảng Cộng ${base}`,
    items: Array.from({ length: 10 }, (_, j) => ({
      formula: `${base} + ${j + 1}`,
      a: base,
      b: j + 1,
      res: base + (j + 1),
    })),
  };
});

export const MATH_MULTIPLICATION_TABLES = Array.from({ length: 8 }, (_, i) => {
  const base = i + 2; // Bảng 2 đến 9
  return {
    num: base,
    title: `Bảng Nhân ${base} (Cửu chương ${base})`,
    items: Array.from({ length: 10 }, (_, j) => ({
      formula: `${base} × ${j + 1}`,
      a: base,
      b: j + 1,
      res: base * (j + 1),
    })),
  };
});

export const MATH_SUBTRACTION_TABLES = Array.from({ length: 9 }, (_, i) => {
  const base = i + 1;
  return {
    num: base,
    title: `Bảng Trừ ${base}`,
    items: Array.from({ length: 10 }, (_, j) => ({
      formula: `${base + j + 1} - ${base}`,
      a: base + j + 1,
      b: base,
      res: j + 1,
    })),
  };
});

export const MATH_DIVISION_TABLES = Array.from({ length: 8 }, (_, i) => {
  const base = i + 2; // Bảng chia 2 đến 9
  return {
    num: base,
    title: `Bảng Chia ${base}`,
    items: Array.from({ length: 10 }, (_, j) => ({
      formula: `${base * (j + 1)} ÷ ${base}`,
      a: base * (j + 1),
      b: base,
      res: j + 1,
    })),
  };
});

// THUẬT TOÁN TỰ ĐỘNG GIẢI MỌI PHÉP TÍNH CỘNG, TRỪ, NHÂN, CHIA CHO BÉ
export function calculateMathProblem(input: string): MathLearningData | null {
  const clean = input.toLowerCase().trim();

  // Regex matches:
  // "5 + 3", "5 cộng 3", "cộng 5 với 3", "tính 5 + 3"
  // "12 - 7", "12 trừ 7", "12 bớt 7"
  // "6 * 4", "6 x 4", "6 nhân 4", "6 nhân với 4"
  // "15 / 3", "15 : 3", "15 chia 3", "15 chia cho 3"

  let op: "add" | "subtract" | "multiply" | "divide" | null = null;
  let a = 0;
  let b = 0;

  // 1. Phép nhân
  const mulMatch = clean.match(/(\d+)\s*(?:[\*xX×]|nhân(?:\svới)?)\s*(\d+)/);
  if (mulMatch) {
    op = "multiply";
    a = parseInt(mulMatch[1], 10);
    b = parseInt(mulMatch[2], 10);
  }

  // 2. Phép chia
  if (!op) {
    const divMatch = clean.match(/(\d+)\s*(?:[\/:\÷]|chia(?:\scho)?)\s*(\d+)/);
    if (divMatch) {
      op = "divide";
      a = parseInt(divMatch[1], 10);
      b = parseInt(divMatch[2], 10);
    }
  }

  // 3. Phép cộng
  if (!op) {
    const addMatch = clean.match(/(?:tính|cộng)?\s*(\d+)\s*(?:\+|cộng(?:\svới)?)\s*(\d+)/);
    if (addMatch) {
      op = "add";
      a = parseInt(addMatch[1], 10);
      b = parseInt(addMatch[2], 10);
    }
  }

  // 4. Phép trừ
  if (!op) {
    const subMatch = clean.match(/(?:tính)?\s*(\d+)\s*(?:\-|trừ(?:\sđi)?|bớt)\s*(\d+)/);
    if (subMatch) {
      op = "subtract";
      a = parseInt(subMatch[1], 10);
      b = parseInt(subMatch[2], 10);
    }
  }

  if (!op || isNaN(a) || isNaN(b)) {
    return null;
  }

  if (op === "add") {
    const res = a + b;
    return {
      operation: "add",
      operationSymbol: "+",
      operand1: a,
      operand2: b,
      result: res,
      operationNameVi: "Phép Cộng (Gộp Lại)",
      stepsExplanation: [
        `Bước 1: Ta có nhóm thứ nhất gồm ${a} vật phẩm 🍎.`,
        `Bước 2: Ta gộp thêm nhóm thứ hai gồm ${b} vật phẩm 🍎 vào.`,
        `Bước 3: Đếm tất cả lại ta được tổng là: ${a} + ${b} = ${res}!`,
      ],
      visualItems: {
        emoji: "🍎",
        label: "Quả Táo",
        group1Count: Math.min(a, 20),
        group2Count: Math.min(b, 20),
        totalCount: Math.min(res, 40),
      },
      tableData: Array.from({ length: 5 }, (_, idx) => ({
        formula: `${a} + ${idx + 1}`,
        result: a + idx + 1,
      })),
      practiceQuiz: {
        question: `Bé thử tài nhé: Nếu có ${a + 1} quả táo mà thêm ${b} quả nữa thì bằng bao nhiêu?`,
        options: [res - 1, res + 1, res + 2],
        correctAnswer: res + 1,
        explanation: `Đúng rồi! (${a + 1}) + ${b} = ${res + 1}! Bé tính nhẩm siêu quá! 🎉`,
      },
    };
  }

  if (op === "subtract") {
    const res = a - b;
    return {
      operation: "subtract",
      operationSymbol: "-",
      operand1: a,
      operand2: b,
      result: res,
      operationNameVi: "Phép Trừ (Bớt Đi)",
      stepsExplanation: [
        `Bước 1: Ban đầu ta có tất cả ${a} cây kẹo 🍭.`,
        `Bước 2: Ta bớt đi (hoặc cho bạn) ${b} cây kẹo 🍭.`,
        `Bước 3: Số kẹo còn lại trên bàn là: ${a} - ${b} = ${res}!`,
      ],
      visualItems: {
        emoji: "🍭",
        label: "Cây Kẹo",
        group1Count: Math.min(a, 20),
        group2Count: Math.min(b, 20),
        totalCount: Math.min(Math.max(res, 0), 20),
      },
      practiceQuiz: {
        question: `Thử sức tiếp nào: Có ${a} cây kẹo mà bớt đi ${b > 1 ? b - 1 : 1} cây thì còn lại mấy cây?`,
        options: [res, res + 1, res - 1],
        correctAnswer: res + (b > 1 ? 1 : 0),
        explanation: `Tuyệt vời! Bé nắm vững bản chất phép trừ rồi đó nha! 🌟`,
      },
    };
  }

  if (op === "multiply") {
    const res = a * b;
    return {
      operation: "multiply",
      operationSymbol: "×",
      operand1: a,
      operand2: b,
      result: res,
      operationNameVi: "Phép Nhân (Lấy Nhiều Lần)",
      stepsExplanation: [
        `Bước 1: Bản chất phép nhân là phép cộng các số giống nhau.`,
        `Bước 2: ${a} × ${b} có nghĩa là lấy số ${a} lặp lại ${b} lần: (${Array(Math.min(b, 8)).fill(a).join(" + ") + (b > 8 ? "..." : "")}).`,
        `Bước 3: Tính tổng tất cả ta được kết quả: ${a} × ${b} = ${res}!`,
      ],
      visualItems: {
        emoji: "⭐",
        label: "Ngôi Sao",
        group1Count: Math.min(a, 10),
        group2Count: Math.min(b, 10),
        totalCount: Math.min(res, 50),
      },
      tableData: Array.from({ length: 10 }, (_, idx) => ({
        formula: `${a} × ${idx + 1}`,
        result: a * (idx + 1),
      })),
      practiceQuiz: {
        question: `Bé thử nhân tiếp nhé: ${a} × ${b + 1} = ?`,
        options: [res + a, res + a - 1, res + a + 2],
        correctAnswer: res + a,
        explanation: `Chính xác! Lấy thêm một lần ${a} nữa là ${res} + ${a} = ${res + a}! 🎈`,
      },
    };
  }

  if (op === "divide") {
    if (b === 0) return null;
    const quotient = Math.floor(a / b);
    const remainder = a % b;
    return {
      operation: "divide",
      operationSymbol: "÷",
      operand1: a,
      operand2: b,
      result: quotient,
      operationNameVi: "Phép Chia (Chia Đều)",
      stepsExplanation: [
        `Bước 1: Ta có ${a} chiếc bánh quy 🍪 đem chia đều cho ${b} bạn nhỏ.`,
        `Bước 2: Mỗi bạn sẽ nhận được đúng ${quotient} chiếc bánh${remainder > 0 ? ` (còn dư ${remainder} cái)` : ""}.`,
        `Bước 3: Kết luận: ${a} ÷ ${b} = ${quotient}${remainder > 0 ? ` (dư ${remainder})` : ""}!`,
      ],
      visualItems: {
        emoji: "🍪",
        label: "Bánh Quy",
        group1Count: Math.min(a, 20),
        group2Count: Math.min(b, 10),
        totalCount: Math.min(quotient, 10),
      },
      tableData: Array.from({ length: 5 }, (_, idx) => ({
        formula: `${b * (idx + 1)} ÷ ${b}`,
        result: idx + 1,
      })),
      practiceQuiz: {
        question: `Đố vui: Nếu có ${b * 2} chiếc bánh chia đều cho ${b} bạn thì mỗi bạn được mấy cái?`,
        options: [1, 2, 3],
        correctAnswer: 2,
        explanation: `Đúng rồi! ${b * 2} ÷ ${b} = 2 chiếc bánh mỗi bạn! 🍪✨`,
      },
    };
  }

  return null;
}
