import { StarBadge } from "../types";

export const INITIAL_BADGES: StarBadge[] = [
  {
    id: "badge_first_friend",
    title: "Bạn Thân Của Kuromi",
    description: "Lần đầu tiên gặp gỡ và chia sẻ bí mật cùng Kuromi-sama!",
    icon: "🎀",
    category: "friendship",
    earnedAt: new Date().toISOString(),
  },
  {
    id: "badge_alphabet_master",
    title: "Ngôi Sao Chữ Cái",
    description: "Khám phá thế giới chữ cái và từ vựng tiếng Việt kỳ diệu.",
    icon: "🔤",
    category: "language",
  },
  {
    id: "badge_why_explorer",
    title: "Nhà Thám Hiểm Vì Sao",
    description: "Khám phá bí mật vì sao trời mưa, cầu vồng và các vì sao.",
    icon: "✨",
    category: "science",
  },
  {
    id: "badge_story_listener",
    title: "Người Giữ Chuyện Cổ Tích",
    description: "Thưởng thức những chuyến phiêu lưu và bài học nhân ái.",
    icon: "📖",
    category: "story",
  },
  {
    id: "badge_riddle_genius",
    title: "Siêu Trí Tuệ Đố Vui",
    description: "Giải đố xuất sắc những câu đố mẹo dân gian vui nhộn.",
    icon: "👑",
    category: "quiz",
  },
  {
    id: "badge_artist_goth",
    title: "Họa Sĩ Phép Thuật",
    description: "Tự tay vẽ nên tác phẩm sáng tạo trên Bảng Ma Thuật.",
    icon: "🎨",
    category: "friendship",
  },
  {
    id: "badge_bilingual_star",
    title: "Chiến Binh Song Ngữ",
    description: "Học giỏi cả Tiếng Việt và Tiếng Anh cùng Kuromi.",
    icon: "🌍",
    category: "language",
  },
];
