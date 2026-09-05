import { createClient } from "@/lib/supabase/server";
import { Card, Badge, Button } from "@/components/ui";
import type { AiEmployee } from "@/lib/types";
import { EMPLOYEE_ICON_NAMES, employeeIcon } from "@/lib/employee-icons";
import { createEmployee, toggleEmployeeStatus } from "../actions";

export default async function AdminEmployeesPage() {
  const supabase = await createClient();
  const { data: employees } = await supabase
    .from("ai_employees")
    .select("*")
    .order("level_required", { ascending: true })
    .returns<AiEmployee[]>();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">
          AI Employees
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Roster d&apos;AI Employees</h1>
      </div>

      <Card>
        <p className="mb-4 font-display text-lg font-semibold">Nouvel AI Employee</p>
        <form action={createEmployee} className="grid grid-cols-2 gap-3">
          <input name="name" placeholder="Nom" required className="input" />
          <input name="role" placeholder="Rôle" required className="input" />
          <textarea
            name="specialty"
            placeholder="Spécialité"
            required
            className="input col-span-2"
            rows={2}
          />
          <input
            name="level_required"
            type="number"
            min={1}
            defaultValue={1}
            placeholder="Niveau requis"
            required
            className="input"
          />
          <select name="icon" defaultValue="Bot" className="input">
            {EMPLOYEE_ICON_NAMES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <input
            name="execution_capacity"
            type="number"
            min={1}
            max={100}
            defaultValue={70}
            placeholder="Execution capacity"
            required
            className="input"
          />
          <input
            name="precision_rate"
            type="number"
            step="0.01"
            min={0}
            max={1}
            defaultValue={0.9}
            placeholder="Precision rate (0-1)"
            required
            className="input"
          />
          <input
            name="speed_index"
            type="number"
            step="0.1"
            min={0}
            defaultValue={1}
            placeholder="Speed index"
            required
            className="input"
          />
          <input
            name="synergy_bonus"
            type="number"
            step="0.01"
            min={0}
            defaultValue={0.05}
            placeholder="Synergy bonus"
            required
            className="input"
          />
          <Button type="submit" className="col-span-2 mt-1">
            Ajouter au roster
          </Button>
        </form>
      </Card>

      <div className="flex flex-col gap-3">
        {(employees ?? []).map((e) => {
          const Icon = employeeIcon(e.icon);
          return (
            <Card key={e.id} className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-tint text-accent-strong">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-medium">
                    {e.name} <span className="text-ink-faint">· Niveau {e.level_required}+</span>
                  </p>
                  <p className="text-xs text-ink-soft">
                    {e.role} — {e.specialty}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={e.active ? "good" : "neutral"}>
                  {e.active ? "active" : "inactive"}
                </Badge>
                <form action={toggleEmployeeStatus}>
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="next_active" value={(!e.active).toString()} />
                  <Button type="submit" variant="ghost" className="px-3 py-1.5 text-xs">
                    {e.active ? "Désactiver" : "Activer"}
                  </Button>
                </form>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
