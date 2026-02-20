export interface User {
  id: number;
  email_address: string;
  created_at: string;
  updated_at: string;
}

export interface Plant {
  id: number;
  name: string;
  acquired_date: string | null;
  blooming_size: boolean;
  todo: string | null;
  location: string | null;
  last_update_date: string | null;
  last_photo_date: string | null;
  slow_release_date: string | null;
  repotted_date: string | null;
  orchid_family: string | null;
  summer_in_out: string | null;
  vendor: string | null;
  cost: string | null;
  shipping_cost: string | null;
  total_cost: string | null;
  mislabeled_original_tag: string | null;
  light: string | null;
  water: string | null;
  temperature: string | null;
  common_issues: string | null;
  dormancy: string | null;
  orchid_ancestry_link: string | null;
  species_ancestry: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export type PlantFormData = Omit<Plant, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export interface Blooming {
  id: number;
  plant_id: number;
  inflorescence_started_date: string | null;
  in_full_bloom_date: string | null;
  withered_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: number;
  plant_id: number;
  blooming_id: number | null;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  message: string;
  errors?: string[];
}
