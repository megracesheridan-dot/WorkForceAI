export type AssignmentStatus =
  | "offered"
  | "in_progress"
  | "paused"
  | "completed";

export interface Profile {
  id: string;
  display_name: string | null;
  is_admin: boolean;
  level: number;
  credit_balance: number;
  withdrawable_balance: number;
  bonus_credits: number;
  account_status: "active" | "suspended";
  payout_method: string | null;
  payout_address: string | null;
  cycle_position: number;
  cycle_total: number;
  team_id: string | null;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface WorkforceLevel {
  level: number;
  name: string;
  employees_count: number;
  assignments_per_day: number;
  unlock_cost: number;
  description: string | null;
}

export interface AiEmployee {
  id: string;
  name: string;
  role: string;
  specialty: string;
  level_required: number;
  execution_capacity: number;
  precision_rate: number;
  speed_index: number;
  synergy_bonus: number;
  active: boolean;
  icon: string;
}

export interface SiteSettings {
  id: boolean;
  hero_title: string;
  hero_subtitle: string;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  contact_telegram: string | null;
  contact_whatsapp: string | null;
  contact_live_chat: string | null;
  show_email: boolean;
  show_phone: boolean;
  show_telegram: boolean;
  show_whatsapp: boolean;
  show_live_chat: boolean;
  updated_at: string;
}

export interface PartnerLogo {
  id: string;
  name: string;
  logo_path: string;
  website_url: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface AssignmentCatalogueItem {
  id: string;
  level_required: number;
  title: string;
  category: string;
  objective: string;
  audience: string | null;
  tone: string | null;
  deliverable_expected: string;
  recommended_roles: string[];
  credit_cost: number;
  reward_min: number;
  reward_max: number;
  quality_target: number;
  estimated_execution_seconds: number;
  brief_context: Record<string, string>;
  status: "active" | "inactive";
  created_at: string;
}

export interface AssignmentInstance {
  id: string;
  user_id: string;
  catalogue_id: string;
  cycle_position: number;
  status: AssignmentStatus;
  credit_cost: number;
  reward_min: number;
  reward_max: number;
  reward_granted: number | null;
  missing_role: string | null;
  execution_job_id: string | null;
  request_key: string | null;
  quality_target: number | null;
  estimated_execution_seconds: number | null;
  deliverable: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  assignment_catalogue?: AssignmentCatalogueItem;
}

export interface ExecutionJob {
  id: string;
  assignment_instance_id: string;
  user_id: string;
  status: "queued" | "running" | "paused" | "completed" | "retryable" | "failed";
  quality_target: number;
  quality_score: number | null;
  required_refill: number;
  projected_reward: number | null;
  pause_reason: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface ExecutionStep {
  id: string;
  job_id: string;
  employee_id: string;
  sequence: number;
  status: "queued" | "running" | "completed" | "failed";
  output_text: string | null;
  started_at: string | null;
  completed_at: string | null;
  ai_employees?: Pick<AiEmployee, "id" | "name" | "role"> | null;
}

export interface AssignmentPositionRule {
  id: string;
  user_id: string;
  cycle_date: string;
  cycle_position: number;
  catalogue_id: string;
  active: boolean;
  consumed_at: string | null;
}

export interface LedgerTransaction {
  id: string;
  user_id: string;
  type: "assignment_cost" | "assignment_reward" | "deposit" | "withdrawal" | "bonus_credit" | "level_upgrade";
  amount: number;
  balance_after: number;
  reference_id: string | null;
  note: string | null;
  created_at: string;
}

export interface DepositRequest {
  id: string;
  user_id: string;
  amount: number;
  method: string;
  proof_path: string;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  profiles?: { display_name: string | null };
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  destination: string;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  profiles?: { display_name: string | null };
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
}
