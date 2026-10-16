export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      books: {
        Row: {
          id: string;
          name: string;
          partner1_name: string;
          partner2_name: string;
          story_start_date: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          partner1_name: string;
          partner2_name: string;
          story_start_date: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          partner1_name?: string;
          partner2_name?: string;
          story_start_date?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      book_members: {
        Row: {
          book_id: string;
          user_id: string;
          role: "creator" | "partner";
          joined_at: string;
        };
        Insert: {
          book_id: string;
          user_id: string;
          role?: "creator" | "partner";
          joined_at?: string;
        };
        Update: {
          book_id?: string;
          user_id?: string;
          role?: "creator" | "partner";
          joined_at?: string;
        };
        Relationships: [];
      };
      invites: {
        Row: {
          id: string;
          book_id: string;
          code_hash: string;
          created_by: string;
          expires_at: string;
          used_at: string | null;
          used_by: string | null;
          revoked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          code_hash: string;
          created_by: string;
          expires_at?: string;
          used_at?: string | null;
          used_by?: string | null;
          revoked_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          book_id?: string;
          code_hash?: string;
          created_by?: string;
          expires_at?: string;
          used_at?: string | null;
          used_by?: string | null;
          revoked_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      chapters: {
        Row: {
          id: string;
          book_id: string;
          author_id: string;
          title: string;
          event_date: string;
          body: string;
          is_milestone: boolean;
          milestone_type: string | null;
          mood_tag: string | null;
          location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          author_id: string;
          title: string;
          event_date: string;
          body: string;
          is_milestone?: boolean;
          milestone_type?: string | null;
          mood_tag?: string | null;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          book_id?: string;
          author_id?: string;
          title?: string;
          event_date?: string;
          body?: string;
          is_milestone?: boolean;
          milestone_type?: string | null;
          mood_tag?: string | null;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      chapter_images: {
        Row: {
          id: string;
          chapter_id: string;
          storage_path: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          storage_path: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          chapter_id?: string;
          storage_path?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_book_with_creator: {
        Args: {
          p_name: string;
          p_partner1_name: string;
          p_partner2_name: string;
          p_story_start_date: string;
        };
        Returns: string;
      };
      accept_book_invite: {
        Args: {
          p_code_hash: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Book = Database["public"]["Tables"]["books"]["Row"];
export type BookMember = Database["public"]["Tables"]["book_members"]["Row"];
export type Invite = Database["public"]["Tables"]["invites"]["Row"];
export type Chapter = Database["public"]["Tables"]["chapters"]["Row"];
export type ChapterImage = Database["public"]["Tables"]["chapter_images"]["Row"];

export interface ChapterImageWithUrl extends ChapterImage {
  signedUrl?: string;
}

export interface ChapterWithDetails extends Chapter {
  images: ChapterImageWithUrl[];
  authorProfile?: Profile | null;
}

export interface BookWithMembers extends Book {
  members: Array<{
    user_id: string;
    role: "creator" | "partner";
    joined_at: string;
    profile?: Profile | null;
  }>;
  activeInvite?: Invite | null;
  chapters?: ChapterWithDetails[];
}

export type MilestoneType =
  | "first_meet"
  | "proposal"
  | "engagement"
  | "wedding"
  | "trip"
  | "anniversary"
  | "new_home"
  | "special_moment"
  | "other";

export type MoodTag =
  | "romantic"
  | "joyful"
  | "funny"
  | "nostalgic"
  | "cozy"
  | "peaceful"
  | "special";

export interface MilestoneInfo {
  id: MilestoneType;
  label: string;
  iconName: string;
  badgeClass: string;
}

export interface MoodInfo {
  id: MoodTag;
  label: string;
  emoji: string;
  colorClass: string;
}

export const MILESTONE_TYPES: Record<MilestoneType, MilestoneInfo> = {
  first_meet: { id: "first_meet", label: "أول لقاء", iconName: "Sparkles", badgeClass: "bg-[#FDF2E9] text-[#B9770E] border-[#F5CBA7]" },
  proposal: { id: "proposal", label: "طلب الزواج", iconName: "HeartHandshake", badgeClass: "bg-[#FDEDEC] text-[#922B21] border-[#F5B7B1]" },
  engagement: { id: "engagement", label: "يوم الخطوبة", iconName: "Crown", badgeClass: "bg-[#F5EEF8] text-[#6C3483] border-[#D7BDE2]" },
  wedding: { id: "wedding", label: "يوم الزفاف", iconName: "Heart", badgeClass: "bg-[#FAF0EE] text-[#7C2D37] border-[#E8C2BF]" },
  trip: { id: "trip", label: "سفر ومغامرة", iconName: "Compass", badgeClass: "bg-[#EBF5FB] text-[#21618C] border-[#AED6F1]" },
  anniversary: { id: "anniversary", label: "ذكرى سنوية", iconName: "Gift", badgeClass: "bg-[#FEF9E7] text-[#7D6608] border-[#F9E79F]" },
  new_home: { id: "new_home", label: "بيتنا الجديد", iconName: "Home", badgeClass: "bg-[#EAFAF1] text-[#196F3D] border-[#A9DFBF]" },
  special_moment: { id: "special_moment", label: "لحظة استثنائية", iconName: "Star", badgeClass: "bg-[#F4ECF7] text-[#5B2C6F] border-[#D2B4DE]" },
  other: { id: "other", label: "علامة فارقة", iconName: "Bookmark", badgeClass: "bg-[#F2F3F4] text-[#34495E] border-[#BDC3C7]" },
};

export const MOOD_TAGS: Record<MoodTag, MoodInfo> = {
  romantic: { id: "romantic", label: "رومانسي", emoji: "❤️", colorClass: "bg-[#FAF0EE] text-[#7C2D37] border-[#E8C2BF]" },
  joyful: { id: "joyful", label: "بهجة وفرح", emoji: "✨", colorClass: "bg-[#FEF9E7] text-[#B7950B] border-[#F9E79F]" },
  funny: { id: "funny", label: "ضحك ومرح", emoji: "😄", colorClass: "bg-[#E8F8F5] text-[#117A65] border-[#A3E4D7]" },
  nostalgic: { id: "nostalgic", label: "حنين وشوق", emoji: "🍂", colorClass: "bg-[#FDF2E9] text-[#A04000] border-[#EDBB99]" },
  cozy: { id: "cozy", label: "دافئ ومريح", emoji: "☕", colorClass: "bg-[#F5EEF8] text-[#6C3483] border-[#D7BDE2]" },
  peaceful: { id: "peaceful", label: "هدوء وسلام", emoji: "🕊️", colorClass: "bg-[#EBF5FB] text-[#2471A3] border-[#AED6F1]" },
  special: { id: "special", label: "لحظة لا تُنسى", emoji: "🌟", colorClass: "bg-[#FDEDEC] text-[#922B21] border-[#FADBD8]" },
};

