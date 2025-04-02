
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  hours_logged: number;
  estimated_hours: number;
  project_id: string;
  auth_user_id?: string;
  created_at?: string;
  updated_at?: string;
  url_mapping?: string;
}

export interface TaskFormData {
  id?: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  estimated_hours: number;
  url_mapping?: string;
  project_id: string;
  url_mappings?: UrlMapping[];
}

export interface Screenshot {
  id: string;
  task_id: string;
  url: string;
  thumbnail_url?: string;
  timestamp: string;
  auth_user_id?: string;
  created_at?: string;
}

export interface UrlMapping {
  id?: string;
  task_id: string;
  title: string;
  url: string;
  auth_user_id?: string;
  created_at?: string;
  updated_at?: string;
}
