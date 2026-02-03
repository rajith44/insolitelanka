export interface MediaItem {
  id: number;
  url: string | null;
  type: string | null;
  fileName: string | null;
  realName: string | null;
  extension: string | null;
  size: number;
  createdAt?: string;
}

export interface MediaListResponse {
  data: MediaItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface MediaPickerConfig {
  /** Allow selecting multiple items (default: false) */
  multiple?: boolean;
  /** Filter by type: 'image' | 'video' | null for all */
  type?: 'image' | 'video' | null;
}
