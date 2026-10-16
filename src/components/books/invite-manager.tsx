"use client";

import { useState } from "react";
import { Check, Copy, Link as LinkIcon, RefreshCw, ShieldCheck, UserCheck, Users } from "lucide-react";
import { createPartnerInviteAction } from "@/actions/invites";
import type { BookWithMembers } from "@/lib/types/database";

interface InviteManagerProps {
  book: BookWithMembers;
  currentUserId: string;
}

export function InviteManager({ book, currentUserId }: InviteManagerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const memberCount = book.members.length;
  const isFull = memberCount >= 2;

  const handleGenerateInvite = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await createPartnerInviteAction(book.id);
      if (res.success && res.inviteCode) {
        setInviteCode(res.inviteCode);
      } else {
        setError(res.error || "تعذر إنشاء رمز الدعوة.");
      }
    } catch {
      setError("حدث خطأ غير متوقع أثناء إنشاء الدعوة.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getInviteUrl = (code: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/invite/${code}`;
    }
    return `/invite/${code}`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#EBE3DA] p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#2D2321]">
          <Users className="w-4 h-4 text-[#7C2D37]" />
          <span>عضوية الكتاب</span>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-[#FAF0EE] text-[#7C2D37] font-semibold">
          {memberCount} من 2 أعضاء
        </span>
      </div>

      {/* Members list */}
      <div className="space-y-2 mb-6">
        {book.members.map((member) => {
          const isCurrentUser = member.user_id === currentUserId;
          const displayName = member.profile?.display_name || "مستخدم";
          return (
            <div
              key={member.user_id}
              className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#EBE3DA]/80"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#E8B4B8]/30 text-[#7C2D37] flex items-center justify-center font-bold text-xs">
                  {displayName.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2D2321] flex items-center gap-1.5">
                    <span>{displayName}</span>
                    {isCurrentUser && (
                      <span className="text-[10px] text-[#7A6C68] font-normal">
                        (أنت)
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#7A6C68]">
                    {member.role === "creator" ? "منشئ الكتاب" : "شريك القصة"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-[#117A65] font-medium bg-[#E8F8F5] px-2 py-0.5 rounded-md">
                <UserCheck className="w-3 h-3" />
                <span>متصل</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Partner status & invite section */}
      {isFull ? (
        <div className="p-3.5 rounded-xl bg-[#FAF0EE] border border-[#F2DDD9] flex items-center gap-2.5 text-xs text-[#7C2D37]">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>
            اكتملت عضوية الكتاب! كلا الشريكين متصلان الآن والذكريات محمية ومشتركة بينكما فقط.
          </span>
        </div>
      ) : (
        <div className="border-t border-[#EBE3DA] pt-4">
          <div className="text-xs text-[#7A6C68] mb-3 leading-relaxed">
            لم ينضم شريكك بعد. أنشئ رابط دعوة خاص وآمن وشاركه معه لينضم مباشرة إلى هذا الكتاب.
          </div>

          {error && (
            <div className="mb-3 p-3 rounded-xl bg-[#FDEDEC] border border-[#FADBD8] text-[#922B21] text-xs">
              {error}
            </div>
          )}

          {inviteCode ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#F4EFEB] border border-[#EBE3DA] space-y-2">
                <div className="text-[11px] font-semibold text-[#2D2321]">
                  رابط الدعوة الخاص بشريكك:
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getInviteUrl(inviteCode)}
                    className="w-full text-xs font-mono bg-white px-3 py-2 rounded-lg border border-[#EBE3DA] text-[#2D2321] select-all outline-hidden"
                  />
                  <button
                    onClick={() => handleCopy(getInviteUrl(inviteCode))}
                    className="shrink-0 px-3 py-2 rounded-lg bg-[#7C2D37] text-white text-xs font-medium hover:bg-[#67222B] transition-colors flex items-center gap-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-[#7A6C68]">
                  • الرابط صالح لمدة 7 أيام ويُستخدم مرة واحدة فقط لشخص واحد.
                </p>
              </div>

              <button
                onClick={() => setInviteCode(null)}
                className="text-xs text-[#7A6C68] hover:text-[#7C2D37] underline"
              >
                إخفاء الرابط
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerateInvite}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 rounded-xl bg-[#7C2D37] text-white text-xs font-semibold hover:bg-[#67222B] transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              {isGenerating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LinkIcon className="w-3.5 h-3.5" />
              )}
              <span>{isGenerating ? "جارٍ إنشاء الرابط..." : "إنشاء رابط دعوة للشريك"}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
