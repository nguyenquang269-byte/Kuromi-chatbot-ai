import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Sparkles,
  Check,
  RotateCcw,
  Shirt,
  Crown,
  Wand2,
  BookOpen,
  Utensils,
  Glasses,
  Flame,
} from "lucide-react";
import {
  KuromiWardrobeState,
  KuromiOutfitId,
  KuromiHeadwearId,
  KuromiAccessoryId,
} from "../types";
import { DEFAULT_WARDROBE } from "../utils/storage";
import { soundFX, speakKuromiText } from "../utils/speech";

interface WardrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWardrobe: KuromiWardrobeState;
  onSaveWardrobe: (wardrobe: KuromiWardrobeState) => void;
}

interface ItemOption<T> {
  id: T;
  name: string;
  desc: string;
  tag: string;
  icon: string;
  color: string;
  voiceLine: string;
}

export const OUTFIT_OPTIONS: ItemOption<KuromiOutfitId>[] = [
  {
    id: "classic_goth",
    name: "Goth-Loli Cổ Điển",
    desc: "Váy Jester tím nhung đen bí ẩn phong cách gothic loli trứ danh của Kuromi-sama!",
    tag: "Kinh Điển",
    icon: "🖤",
    color: "from-purple-900 via-indigo-950 to-purple-900 border-purple-500",
    voiceLine: "Bộ váy Goth Lolita này luôn là số 1 trong lòng Kuromi đó nha!",
  },
  {
    id: "biker_leader",
    name: "Thủ Lĩnh Biker Kuromi's 5",
    desc: "Áo khoác da punk rock đính đinh tán sành điệu, sẵn sàng lái xe ba bánh dạo phố!",
    tag: "Tomboy Ngầu",
    icon: "🏍️",
    color: "from-zinc-900 via-neutral-900 to-pink-950 border-pink-500",
    voiceLine: "Lên xe ba bánh cùng băng Kuromi's 5 dạo phố thôi nào bạn nhỏ ơi!",
  },
  {
    id: "master_chef",
    name: "Bếp Trưởng Nhí Tài Ba",
    desc: "Tạp dề nấu nướng xinh xắn, trổ tài làm món hành tây tím và thịt nướng thơm lừng!",
    tag: "Khéo Tay",
    icon: "🍳",
    color: "from-amber-950 via-rose-950 to-pink-950 border-amber-500",
    voiceLine: "Kuromi nấu ăn siêu ngon luôn! Để tớ làm món hành tây tím xắt nhỏ chiêu đãi bạn nhé!",
  },
  {
    id: "romantic_lady",
    name: "Tiểu Thư Lãng Mạn",
    desc: "Váy dạ hội hồng pastel xếp tầng điệu đà, mơ màng đọc tiểu thuyết tình cảm!",
    tag: "Mơ Mộng",
    icon: "🎀",
    color: "from-pink-950 via-rose-900 to-purple-950 border-pink-400",
    voiceLine: "Váy hồng mơ mộng ghê~ Vừa mặc vừa đọc tiểu thuyết tình cảm là hết sẩy!",
  },
  {
    id: "smart_sensei",
    name: "Cô Giáo Sensei Thông Thái",
    desc: "Áo choàng học giả và nơ cổ tri thức, đồng hành cùng bạn nhỏ học tập giỏi giang!",
    tag: "Tri Thức",
    icon: "🎓",
    color: "from-indigo-950 via-purple-950 to-blue-950 border-indigo-400",
    voiceLine: "Sensei Kuromi đã sẵn sàng dạy bạn học tiếng Anh và tiếng Việt thật giỏi nè!",
  },
  {
    id: "sakura_kimono",
    name: "Kimono Hoa Anh Đào",
    desc: "Kimono truyền thống thêu cánh hoa anh đào xứ Phù Tang rực rỡ và duyên dáng!",
    tag: "Lễ Hội",
    icon: "🌸",
    color: "from-rose-950 via-pink-950 to-purple-950 border-rose-400",
    voiceLine: "Kimono hoa anh đào bay bổng quá à! Kuromi cảm ơn bạn nhỏ nha!",
  },
  {
    id: "space_astronaut",
    name: "Phi Hành Gia Vũ Trụ",
    desc: "Bộ đồ phi hành gia trắng bạc viền tím ánh sao, khám phá các thiên hà xa xôi!",
    tag: "Vũ Trụ",
    icon: "🚀",
    color: "from-slate-900 via-cyan-950 to-purple-950 border-cyan-400",
    voiceLine: "3, 2, 1... Phóng tên lửa! Phi hành gia Kuromi cùng bạn nhỏ bay vào vũ trụ nào!",
  },
  {
    id: "fairy_princess",
    name: "Công Chúa Cánh Bướm",
    desc: "Váy dạ hội hoàng gia thêu ren lấp lánh và đôi cánh bướm tím hồng dạ quang!",
    tag: "Cổ Tích",
    icon: "🧚‍♀️",
    color: "from-fuchsia-950 via-purple-950 to-pink-950 border-fuchsia-400",
    voiceLine: "Biến hình thành công chúa cánh tiên lộng lẫy ban phép màu may mắn!",
  },
  {
    id: "detective_sherlock",
    name: "Thám Tử Tài Ba",
    desc: "Áo choàng dạ kẻ ca-rô cổ điển, suy luận phá án và giải đố siêu thông minh!",
    tag: "Phá Án",
    icon: "🔍",
    color: "from-stone-900 via-amber-950 to-neutral-900 border-amber-600",
    voiceLine: "Không một bí ẩn nào có thể qua mắt được đại thám tử Kuromi!",
  },
  {
    id: "punk_rocker",
    name: "Siêu Sao Rocker Punk",
    desc: "Áo khoác đinh tán xích sắt tím đen nổi loạn, bùng cháy trên sân khấu rock!",
    tag: "Rock Star",
    icon: "⚡",
    color: "from-zinc-950 via-purple-950 to-pink-950 border-pink-500",
    voiceLine: "Một, hai, ba, quẩy hết mình cùng giai điệu rock cực chất của Kuromi!",
  },
  {
    id: "magical_girl",
    name: "Nữ Phù Thủy Ma Pháp",
    desc: "Trang phục Mahou Shoujo với dải ruy băng sao đêm và ngọc ước nguyện!",
    tag: "Ma Thuật",
    icon: "✨",
    color: "from-purple-950 via-fuchsia-950 to-indigo-950 border-pink-400",
    voiceLine: "Nhân danh sức mạnh ánh trăng và màn đêm ma thuật, Kuromi xuất chiêu!",
  },
  {
    id: "ocean_mermaid",
    name: "Tiên Cá Biển Sâu",
    desc: "Trang phục vảy xà cừ ngọc trai tím ngọc, tung tăng bơi lội dưới đại dương!",
    tag: "Đại Dương",
    icon: "🧜‍♀️",
    color: "from-teal-950 via-cyan-950 to-purple-950 border-teal-400",
    voiceLine: "Lặn sâu ngắm san hô và tìm kiếm kho báu ngọc trai lấp lánh nào!",
  },
  {
    id: "doctor_nurse",
    name: "Bác Sĩ Trái Tim Yêu Thương",
    desc: "Áo blouse trắng thêu huy hiệu trái tim và ống nghe y tế chăm sóc sức khỏe!",
    tag: "Bác Sĩ",
    icon: "🩺",
    color: "from-sky-950 via-rose-950 to-white/10 border-sky-400",
    voiceLine: "Bác sĩ Kuromi đây! Luôn nhắc nhở bạn nhỏ ăn ngoan, ngủ sớm và giữ ấm nhé!",
  },
  {
    id: "artist_painter",
    name: "Họa Sĩ Sáng Tạo",
    desc: "Áo yếm vẽ tranh vương đốm màu nghệ thuật cùng mũ beret kiểu Pháp cực xinh!",
    tag: "Hội Họa",
    icon: "🎨",
    color: "from-orange-950 via-rose-950 to-purple-950 border-amber-400",
    voiceLine: "Cùng Kuromi cầm cọ vẽ nên bức tranh rực rỡ sắc màu diệu kỳ nào!",
  },
  {
    id: "super_heroine",
    name: "Nữ Anh Hùng Tia Chớp",
    desc: "Bộ giáp chiến binh siêu anh hùng tím neon áo choàng bay bảo vệ công lý!",
    tag: "Dũng Cảm",
    icon: "🦸‍♀️",
    color: "from-indigo-950 via-red-950 to-purple-950 border-yellow-400",
    voiceLine: "Kuromi công lý luôn sẵn sàng bảo vệ hòa bình và bạn nhỏ đáng yêu!",
  },
  {
    id: "cosy_pajamas",
    name: "Đồ Ngủ Mèo Mun Ấm Áp",
    desc: "Bộ pijama nhung bông mềm mịn hình mèo mun, sẵn sàng cho giấc ngủ ngọt ngào!",
    tag: "Ngủ Ngon",
    icon: "🌙",
    color: "from-violet-950 via-indigo-950 to-purple-950 border-violet-400",
    voiceLine: "Ngáp~ Pijama mềm êm quá, chúc bạn nhỏ có những giấc mơ thật đẹp nha!",
  },
  {
    id: "sailor_school",
    name: "Thủy Thủ Học Đường Anime",
    desc: "Đồng phục nữ sinh phong cách thủy thủ Nhật Bản viền sọc đôi cá tính!",
    tag: "Học Đường",
    icon: "⚓",
    color: "from-blue-950 via-indigo-950 to-pink-950 border-blue-400",
    voiceLine: "Kuromi đi học chăm ngoan, quyết tâm giành thật nhiều bông hoa điểm mười!",
  },
  {
    id: "winter_snow",
    name: "Áo Choàng Băng Tuyết",
    desc: "Áo măng tô mùa đông viền lông cừu trắng tinh khôi đính bông tuyết pha lê!",
    tag: "Mùa Đông",
    icon: "❄️",
    color: "from-cyan-950 via-blue-950 to-slate-900 border-cyan-300",
    voiceLine: "Bông tuyết trắng rơi lấp lánh, áo lông ấm áp này thích mê ly luôn!",
  },
  {
    id: "ninja_shadow",
    name: "Ninja Bóng Đêm Shinobi",
    desc: "Trang phục nhẫn giả ninja tím huyền bí phi thân thoăn thoắt trong màn đêm!",
    tag: "Nhẫn Giả",
    icon: "🥷",
    color: "from-neutral-950 via-purple-950 to-zinc-900 border-purple-400",
    voiceLine: "Ninjutsu phân thân chi thuật! Biến hóa thần tốc không ai theo kịp!",
  },
  {
    id: "sports_champion",
    name: "Vận Động Viên Năng Động",
    desc: "Bộ đồ thể thao áo số năng động, rèn luyện thể lực nhanh nhẹn và dẻo dai!",
    tag: "Thể Thao",
    icon: "🏃‍♀️",
    color: "from-red-950 via-orange-950 to-purple-950 border-orange-400",
    voiceLine: "Khỏe khoắn và tràn đầy năng lượng! Cùng Kuromi tập thể dục nào!",
  },
  {
    id: "circus_ringmaster",
    name: "Chủ Gánh Xiếc Ảo Thuật",
    desc: "Áo tuxedo đỏ nhung tím đính cúc vàng lộng lẫy biểu diễn những màn xiếc kỳ thú!",
    tag: "Xiếc Vui",
    icon: "🎪",
    color: "from-red-950 via-purple-950 to-amber-950 border-amber-400",
    voiceLine: "Chào mừng quý khán giả nhí đến với rạp xiếc diệu kỳ của Kuromi!",
  },
  {
    id: "flower_fairy",
    name: "Nàng Tiên Hoa Tulip",
    desc: "Váy kết từ cánh hoa tulip và mẫu đơn rực rỡ tỏa hương thơm ngát đồng nội!",
    tag: "Hoa Cỏ",
    icon: "🌷",
    color: "from-pink-950 via-emerald-950 to-rose-950 border-pink-300",
    voiceLine: "Mỗi đóa hoa tươi thắm là một nụ cười rạng rỡ tặng bạn nhỏ nè!",
  },
  {
    id: "cyber_punk2077",
    name: "Chiến Binh Cyberpunk 2077",
    desc: "Áo khoác công nghệ tương lai viền đèn LED neon dạ quang rực sáng!",
    tag: "Tương Lai",
    icon: "🕶️",
    color: "from-emerald-950 via-cyan-950 to-purple-950 border-emerald-400",
    voiceLine: "Đến từ thế giới tương lai công nghệ cao! Cyber-Kuromi online!",
  },
  {
    id: "baker_pastry",
    name: "Thợ Bánh Kem Ngọt Ngào",
    desc: "Tạp dề làm bánh rắc kẹo cốm màu sắc cùng mũ đầu bếp bánh ngọt xinh xắn!",
    tag: "Làm Bánh",
    icon: "🧁",
    color: "from-rose-950 via-pink-950 to-amber-950 border-rose-300",
    voiceLine: "Kuromi nướng mẻ bánh cupcake dâu tây thơm lừng mời bạn nhỏ nếm thử nha!",
  },
  {
    id: "royal_queen",
    name: "Nữ Hoàng Đêm Trăng Quyền Uy",
    desc: "Áo choàng nhung tím viền lông hoàng gia đính kim cương vương giả cao quý!",
    tag: "Hoàng Gia",
    icon: "👑",
    color: "from-purple-950 via-indigo-950 to-amber-950 border-amber-300",
    voiceLine: "Nữ hoàng Kuromi phong tước hiệp sĩ thông thái cho bạn nhỏ tài năng!",
  },
  {
    id: "rainbow_unicorn",
    name: "Kỳ Lân Cầu Vồng Kỳ Ảo",
    desc: "Váy voan bồng bềnh 7 sắc cầu vồng đính sao pha lê diệu kỳ của xứ sở thần tiên!",
    tag: "Cầu Vồng",
    icon: "🦄",
    color: "from-purple-950 via-pink-950 to-sky-950 border-pink-300",
    voiceLine: "Cầu vồng rực rỡ chiếu sáng bầu trời mang theo niềm vui bất tận!",
  },
];

export const HEADWEAR_OPTIONS: ItemOption<KuromiHeadwearId>[] = [
  {
    id: "pink_skull",
    name: "Đầu Lâu Hồng Gothic",
    desc: "Huy hiệu đầu lâu hồng neon quyền lực số một trên nón Jester!",
    tag: "Biểu Tượng",
    icon: "💀",
    color: "from-pink-900 to-purple-950 border-[#ff31b9]",
    voiceLine: "Đầu lâu hồng quyền lực của Kuromi đây rồi!",
  },
  {
    id: "giant_pink_bow",
    name: "Nơ Lụa Hồng To Bản",
    desc: "Nơ ruy băng satin hồng lấp lánh đính ngọc trai cực kỳ nữ tính!",
    tag: "Dễ Thương",
    icon: "🎀",
    color: "from-rose-900 to-pink-950 border-pink-400",
    voiceLine: "Chiếc nơ hồng to bự này làm Kuromi điệu đà quá chừng luôn!",
  },
  {
    id: "witch_hat",
    name: "Mũ Phù Thủy Nhí",
    desc: "Mũ phù thủy chóp nhọn màu tím huyền bí đính khóa nơ ma thuật!",
    tag: "Ma Thuật",
    icon: "🎩",
    color: "from-purple-950 to-indigo-950 border-purple-400",
    voiceLine: "Úm ba la! Kuromi hóa thân thành phù thủy phép thuật tinh nghịch nè!",
  },
  {
    id: "sakura_flower",
    name: "Cài Hoa Anh Đào",
    desc: "Nhánh hoa anh đào tươi tắn cài nhẹ bên tai Kuromi!",
    tag: "Nhẹ Nhàng",
    icon: "🌸",
    color: "from-pink-950 to-rose-900 border-pink-300",
    voiceLine: "Hoa anh đào thơm ngát cài bên tai Kuromi xinh chưa!",
  },
  {
    id: "biker_bandana",
    name: "Băng Đô Thủ Lĩnh Biker",
    desc: "Băng đô trùm đầu 'K5' phong cách tomboy của trùm băng lái xe ba bánh!",
    tag: "Cực Ngầu",
    icon: "🏍️",
    color: "from-neutral-900 to-purple-950 border-pink-500",
    voiceLine: "Băng đô Kuromi's 5 xuất trận! Ai dám đọ độ ngầu với Kuromi nào!",
  },
];

export const ACCESSORY_OPTIONS: ItemOption<KuromiAccessoryId>[] = [
  {
    id: "none",
    name: "Không Cầm Gì",
    desc: "Hai tay tự do để múa, nhảy và nhí nhảnh cùng bạn nhỏ!",
    tag: "Tự Do",
    icon: "✨",
    color: "from-zinc-900 to-purple-950 border-zinc-700",
    voiceLine: "Hai tay thảnh thơi để vỗ tay khen bạn nhỏ học giỏi nè!",
  },
  {
    id: "kuromi_note",
    name: "Nhật Ký 'Kuromi Note'",
    desc: "Cuốn sổ nhật ký hồng đen huyền thoại ghi lại mọi ấm ức và hiểu lầm với My Melody!",
    tag: "Bí Mật",
    icon: "📖",
    color: "from-pink-950 to-purple-950 border-[#ff31b9]",
    voiceLine: "Đây là cuốn sổ Kuromi Note bí mật của tớ! Tớ sẽ ghi là bạn nhỏ siêu dễ thương vào đây!",
  },
  {
    id: "shallots_skewer",
    name: "Đĩa Hành Tây Tím & Thịt",
    desc: "Món ăn yêu thích nhất của Kuromi: hành tây tím xắt nhỏ thơm bùi cùng xiên thịt nướng!",
    tag: "Món Tủ",
    icon: "🧅",
    color: "from-amber-950 to-rose-950 border-amber-400",
    voiceLine: "Món hành tây tím xắt nhỏ và thịt nướng khoái khẩu của Kuromi đây rồi! Mlem mlem!",
  },
  {
    id: "rocker_sunglasses",
    name: "Kính Mát Rocker Punk",
    desc: "Kính râm ngôi sao sành điệu chuẩn phong cách tomboy nổi loạn của Kuromi!",
    tag: "Sành Điệu",
    icon: "🕶️",
    color: "from-neutral-900 to-pink-950 border-pink-400",
    voiceLine: "Đeo kính râm vào là Kuromi ngầu như ngôi sao nhạc Rock luôn nhé!",
  },
  {
    id: "electric_guitar",
    name: "Đàn Guitar Điện Punk",
    desc: "Cây đàn guitar điện màu tím hồng bùng cháy năng lượng âm nhạc!",
    tag: "Rock Star",
    icon: "🎸",
    color: "from-purple-950 to-pink-950 border-purple-400",
    voiceLine: "Let's Rock! Kuromi sẽ gảy một khúc nhạc sôi động tặng bạn nhỏ!",
  },
  {
    id: "magic_wand",
    name: "Gậy Phép Thuật Trăng Khuyết",
    desc: "Cây gậy ma thuật cánh dơi phát sáng lung linh ban tặng ngôi sao may mắn!",
    tag: "Phép Thuật",
    icon: "🪄",
    color: "from-indigo-950 to-purple-950 border-cyan-400",
    voiceLine: "Gậy phép thuật trăng khuyết biến ra ngàn ngôi sao điểm 10 cho bạn nhỏ nè!",
  },
  {
    id: "punk_crown",
    name: "Vương Miện Công Chúa Punk",
    desc: "Vương miện vàng đính đá thạch anh tím lấp lánh khẳng định vị thế công chúa!",
    tag: "Vương Giả",
    icon: "👑",
    color: "from-amber-950 to-purple-950 border-amber-300",
    voiceLine: "Kuromi-sama xinh đẹp và quyền lực nhận vương miện từ bạn nhỏ đây!",
  },
];

export const WardrobeModal: React.FC<WardrobeModalProps> = ({
  isOpen,
  onClose,
  currentWardrobe,
  onSaveWardrobe,
}) => {
  const [activeTab, setActiveTab] = useState<"outfit" | "headwear" | "accessory">("outfit");
  const [draft, setDraft] = useState<KuromiWardrobeState>(currentWardrobe);

  // Sync draft when opened
  React.useEffect(() => {
    if (isOpen) {
      setDraft(currentWardrobe);
    }
  }, [isOpen, currentWardrobe]);

  if (!isOpen) return null;

  const handleSelectOutfit = (id: KuromiOutfitId, voiceLine: string) => {
    soundFX.playPop();
    const updated = { ...draft, outfit: id };
    setDraft(updated);
    onSaveWardrobe(updated);
    speakKuromiText(voiceLine, { pitch: 1.5, rate: 1.08 });
  };

  const handleSelectHeadwear = (id: KuromiHeadwearId, voiceLine: string) => {
    soundFX.playPop();
    const updated = { ...draft, headwear: id };
    setDraft(updated);
    onSaveWardrobe(updated);
    speakKuromiText(voiceLine, { pitch: 1.5, rate: 1.08 });
  };

  const handleSelectAccessory = (id: KuromiAccessoryId, voiceLine: string) => {
    soundFX.playPop();
    const updated = { ...draft, accessory: id };
    setDraft(updated);
    onSaveWardrobe(updated);
    speakKuromiText(voiceLine, { pitch: 1.5, rate: 1.08 });
  };

  const handleResetDefault = () => {
    soundFX.playMagicChime();
    setDraft(DEFAULT_WARDROBE);
    onSaveWardrobe(DEFAULT_WARDROBE);
    speakKuromiText("Kuromi đã quay trở lại bộ váy Goth Lolita truyền thống rồi nè! 🎀", {
      pitch: 1.5,
      rate: 1.08,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      id="kuromi-wardrobe-modal"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-gradient-to-b from-[#250d3e] via-[#1a082c] to-[#0f041b] rounded-3xl border-2 border-[#ff31b9]/70 shadow-[0_0_50px_rgba(255,49,185,0.4)] flex flex-col max-h-[90vh] overflow-hidden text-purple-100"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-purple-500/30 flex items-center justify-between bg-gradient-to-r from-purple-950/80 to-[#ff31b9]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff31b9] to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(255,49,185,0.6)] text-xl">
              👗
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>Tủ Đồ Thời Trang Kuromi</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ff31b9]/30 border border-[#ff31b9]/60 text-pink-200 font-bold">
                  Goth & Cute
                </span>
              </h2>
              <p className="text-xs text-pink-200/80">
                Thay đổi trang phục, nơ mũ và phụ kiện mang đậm sở thích của Kuromi!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-pink-900/60 border border-purple-500/40 text-pink-300 hover:text-white flex items-center justify-center transition-all"
            id="close-wardrobe-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-4 pt-3 pb-2 flex gap-2 border-b border-purple-500/20 bg-black/30">
          <button
            onClick={() => {
              soundFX.playPop();
              setActiveTab("outfit");
            }}
            className={`flex-1 py-2.5 px-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border ${
              activeTab === "outfit"
                ? "bg-gradient-to-r from-[#ff31b9] to-purple-600 text-white border-pink-300 shadow-[0_0_15px_rgba(255,49,185,0.5)]"
                : "bg-purple-950/40 text-pink-300/80 hover:text-pink-200 border-purple-800/40"
            }`}
          >
            <span>👗</span>
            <span>Trang Phục ({OUTFIT_OPTIONS.length})</span>
          </button>

          <button
            onClick={() => {
              soundFX.playPop();
              setActiveTab("headwear");
            }}
            className={`flex-1 py-2.5 px-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border ${
              activeTab === "headwear"
                ? "bg-gradient-to-r from-[#ff31b9] to-purple-600 text-white border-pink-300 shadow-[0_0_15px_rgba(255,49,185,0.5)]"
                : "bg-purple-950/40 text-pink-300/80 hover:text-pink-200 border-purple-800/40"
            }`}
          >
            <span>🎀</span>
            <span>Mũ & Nơ Đầu ({HEADWEAR_OPTIONS.length})</span>
          </button>

          <button
            onClick={() => {
              soundFX.playPop();
              setActiveTab("accessory");
            }}
            className={`flex-1 py-2.5 px-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border ${
              activeTab === "accessory"
                ? "bg-gradient-to-r from-[#ff31b9] to-purple-600 text-white border-pink-300 shadow-[0_0_15px_rgba(255,49,185,0.5)]"
                : "bg-purple-950/40 text-pink-300/80 hover:text-pink-200 border-purple-800/40"
            }`}
          >
            <span>🪄</span>
            <span>Phụ Kiện Cầm Tay ({ACCESSORY_OPTIONS.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 custom-scrollbar space-y-3">
          {activeTab === "outfit" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {OUTFIT_OPTIONS.map((item) => {
                const isSelected = draft.outfit === item.id;
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectOutfit(item.id, item.voiceLine)}
                    className={`cursor-pointer p-3.5 rounded-2xl border-2 transition-all relative overflow-hidden bg-gradient-to-br ${
                      item.color
                    } ${
                      isSelected
                        ? "border-[#ff31b9] shadow-[0_0_20px_rgba(255,49,185,0.6)] ring-2 ring-pink-400"
                        : "border-purple-800/60 hover:border-pink-400/60 opacity-90 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-1.5">
                            {item.name}
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 text-pink-300 border border-purple-500/40 font-bold">
                            {item.tag}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#ff31b9] text-white flex items-center justify-center shadow-[0_0_10px_#ff31b9]">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-pink-100/80 leading-relaxed">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          )}

          {activeTab === "headwear" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HEADWEAR_OPTIONS.map((item) => {
                const isSelected = draft.headwear === item.id;
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectHeadwear(item.id, item.voiceLine)}
                    className={`cursor-pointer p-3.5 rounded-2xl border-2 transition-all relative overflow-hidden bg-gradient-to-br ${
                      item.color
                    } ${
                      isSelected
                        ? "border-[#ff31b9] shadow-[0_0_20px_rgba(255,49,185,0.6)] ring-2 ring-pink-400"
                        : "border-purple-800/60 hover:border-pink-400/60 opacity-90 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-1.5">
                            {item.name}
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 text-pink-300 border border-purple-500/40 font-bold">
                            {item.tag}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#ff31b9] text-white flex items-center justify-center shadow-[0_0_10px_#ff31b9]">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-pink-100/80 leading-relaxed">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          )}

          {activeTab === "accessory" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ACCESSORY_OPTIONS.map((item) => {
                const isSelected = draft.accessory === item.id;
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectAccessory(item.id, item.voiceLine)}
                    className={`cursor-pointer p-3.5 rounded-2xl border-2 transition-all relative overflow-hidden bg-gradient-to-br ${
                      item.color
                    } ${
                      isSelected
                        ? "border-[#ff31b9] shadow-[0_0_20px_rgba(255,49,185,0.6)] ring-2 ring-pink-400"
                        : "border-purple-800/60 hover:border-pink-400/60 opacity-90 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-1.5">
                            {item.name}
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 text-pink-300 border border-purple-500/40 font-bold">
                            {item.tag}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#ff31b9] text-white flex items-center justify-center shadow-[0_0_10px_#ff31b9]">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-pink-100/80 leading-relaxed">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-purple-500/30 bg-black/40 flex items-center justify-between gap-3">
          <button
            onClick={handleResetDefault}
            className="px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold text-pink-300 hover:text-white bg-purple-950/60 hover:bg-purple-900/60 border border-purple-700/50 flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mặc Định (Goth-Loli)</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-[#ff31b9] to-purple-600 hover:from-pink-500 hover:to-purple-500 border border-pink-300 shadow-[0_0_20px_rgba(255,49,185,0.6)] flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Xong & Chiêm Ngưỡng ✨</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
