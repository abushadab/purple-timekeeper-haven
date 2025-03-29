
export interface Portfolio {
  id: string;
  name: string;
  description: string | null;
  color: string;
  projectCount: number;
  totalHours: number;
  lastUpdated: string;
  archived: boolean;
  auth_user_id?: string | null;
  createdAt: string;
}

export interface PortfolioFormData {
  id?: string;
  name: string;
  description: string;
  color: string;
}
