export type AssignmentStatus =
  | "offered"
  | "specialist_required"
  | "insufficient_credits"
  | "in_progress"
  | "completed";

export interface Profile {
  id: string;
  display_name: string | null;
  is_admin: boolean;
  level: number;
  credit_balance: number;
  withdrawable_balance: number;
  bonus_credits: number;
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
  deliverable: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  assignment_catalogue?: AssignmentCatalogueItem;
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
