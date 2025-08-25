import BudgetClient from "./BudgetClient";

export const dynamic = "force-dynamic"; // biar tidak diprerender

export default function Page() {
  return <BudgetClient />;
}
