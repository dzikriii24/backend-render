export interface CTFRanking {
  id?: number;
  nama: string;
  challenge_terakhir: string; // Fixed typo
  level_terakhir: string;
  score_terakhir: number;
  total_score: number;
  list_soal: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface PageConfig {
  id?: number;
  header_title: string;
  page_title: string;
  description: string;
  updated_at?: Date;
}
