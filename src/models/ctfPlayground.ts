export interface CTFCategory {
  id?: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at?: Date;
}

export interface CTFChallenge {
  id?: number;
  category_id: number;
  title: string;
  description: string;
  level: "Easy" | "Medium" | "Hard";
  price: number;
  hint: string;
  drive_link: string;
  flag: string;
  is_active: boolean;
  sort_order: number;
  created_at?: Date;
}

export interface CTFPageConfig {
  id?: number;
  header_title: string;
  page_subtitle: string;
  updated_at?: Date;
}
