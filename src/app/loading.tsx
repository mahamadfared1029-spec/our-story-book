import { Heart } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] p-4 text-center">
      <div className="relative">
        <div className="w-14 h-14 rounded-full bg-[#FAF0EE] text-[#7C2D37] flex items-center justify-center animate-pulse">
          <Heart className="w-7 h-7 fill-[#7C2D37]/30" />
        </div>
      </div>
      <p className="text-xs text-[#7A6C68] font-medium mt-4">
        جارٍ تحميل صفحات قصتكما...
      </p>
    </div>
  );
}
