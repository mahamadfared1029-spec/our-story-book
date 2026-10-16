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
