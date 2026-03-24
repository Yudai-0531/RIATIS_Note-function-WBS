export interface Task {
  id: string;
  title: string;
  parent_id: string | null;
  start_date: string | null;
  end_date: string | null;
  progress: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
