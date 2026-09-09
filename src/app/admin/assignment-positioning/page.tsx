import { Card, Badge, Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import type { AssignmentCatalogueItem, Profile } from "@/lib/types";
import { scheduleAssignmentPosition } from "../actions";

type PositionRule = {
  id: string;
  user_id: string;
  cycle_date: string;
  cycle_position: number;
  catalogue_id: string;
  active: boolean;
  consumed_at: string | null;
};

export default async function AssignmentPositioningPage() {
  const supabase = await createClient();
  const [{ data: users }, { data: assignments }, { data: rules }] = await Promise.all([
    supabase.from("profiles").select("*").order("display_name").returns<Profile[]>(),
    supabase.from("assignment_catalogue").select("*").eq("status", "active").order("title").returns<AssignmentCatalogueItem[]>(),
    supabase.from("assignment_position_rules").select("*").order("cycle_date", { ascending: true }).order("cycle_position").returns<PositionRule[]>(),
  ]);
  const userName = new Map((users ?? []).map((user) => [user.id, user.display_name || user.id]));
  const assignmentTitle = new Map((assignments ?? []).map((assignment) => [assignment.id, assignment.title]));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">Assignment Positioning</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Cycle scheduling</h1>
      </div>

      <Card>
        <form action={scheduleAssignmentPosition} className="grid gap-3 sm:grid-cols-2">
          <select name="user_id" required className="input">
            <option value="">Select user</option>
            {(users ?? []).map((user) => <option key={user.id} value={user.id}>{user.display_name || user.id}</option>)}
          </select>
          <select name="catalogue_id" required className="input">
            <option value="">Select Assignment</option>
            {(assignments ?? []).map((assignment) => <option key={assignment.id} value={assignment.id}>{assignment.title}</option>)}
          </select>
          <input name="cycle_date" type="date" defaultValue={today} required className="input" />
          <input name="cycle_position" type="number" min="1" required placeholder="Cycle position" className="input" />
          <Button type="submit" className="sm:col-span-2">Schedule Assignment</Button>
        </form>
      </Card>

      <div className="flex flex-col gap-3">
        {(rules ?? []).map((rule) => (
          <Card key={rule.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="font-medium">{assignmentTitle.get(rule.catalogue_id) || rule.catalogue_id}</p>
              <p className="text-xs text-ink-soft">{userName.get(rule.user_id) || rule.user_id} · {rule.cycle_date} · Position {rule.cycle_position}</p>
            </div>
            <Badge tone={rule.active ? "accent" : "neutral"}>{rule.active ? "Scheduled" : "Consumed"}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
