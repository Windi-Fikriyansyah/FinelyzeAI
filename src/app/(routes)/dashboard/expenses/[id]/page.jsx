"use client";
import { use } from "react";
import { useUser } from "@clerk/nextjs";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import { db } from "utils/dbConfig";
import { Dana, Pengeluaran } from "utils/schema";
import BudgetItem from "../../budgets/_components/BudgetItem";
import ExpenseListTable from "../../budgets/_components/ExpenseListTable";
import AddExpense from "../../expenses/_components/AddExpense";
import EditBudget from "../../expenses/_components/EditBudget";
import { Trash, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

function Expenses({ params: paramsPromise }) {
  const params = use(paramsPromise); // ✅ FIX: unwrap the async params
  const { user } = useUser();
  const [budgetInfo, setBudgetInfo] = useState(null);
  const [expensesList, setExpensesList] = useState([]);
  const [isFetched, setIsFetched] = useState(false);
  const route = useRouter();
  const searchParams = useSearchParams();

  const selectedMonth = searchParams.get("month");
  const selectedYear = searchParams.get("year");

  useEffect(() => {
    if (user && params?.id && !isFetched && !isNaN(Number(params.id))) {
      getBudgetInfo();
    }
  }, [user, params]);

  const getBudgetInfo = async () => {
    try {
      const id = Number(params.id);
      if (isNaN(id)) return;

      const result = await db
        .select({
          ...getTableColumns(Dana),
          totalSpend: sql`sum(${Pengeluaran.jumlah})`.mapWith(Number),
          TotalItem: sql`count(${Pengeluaran.id})`.mapWith(Number),
        })
        .from(Dana)
        .leftJoin(Pengeluaran, eq(Dana.id, Pengeluaran.danaId))
        .where(eq(Dana.createdBy, user?.primaryEmailAddress?.emailAddress))
        .where(eq(Dana.id, id))
        .groupBy(Dana.id);

      setBudgetInfo(result[0]);
      getExpensesList(id);
      setIsFetched(true);
    } catch (err) {
      console.error("Gagal mendapatkan data dana:", err);
    }
  };

  const getExpensesList = async (id) => {
    if (isNaN(id)) return;

    const result = await db
      .select()
      .from(Pengeluaran)
      .where(eq(Pengeluaran.danaId, id))
      .orderBy(desc(Pengeluaran.id));

    setExpensesList(result);
  };

  const deleteBudget = async () => {
    const id = Number(params.id);
    if (isNaN(id)) return;

    const deleteExpanseResult = await db
      .delete(Pengeluaran)
      .where(eq(Pengeluaran.danaId, id))
      .returning();

    if (deleteExpanseResult) {
      await db.delete(Dana).where(eq(Dana.id, id)).returning();
      toast("Dana dihapus!");
      route.replace("/dashboard/budgets");
    }
  };

  return (
    <div className="p-10">
      <div className="flex justify-between items-center">
        <div
          onClick={() => {
            if (selectedMonth && selectedYear) {
              route.push(`/dashboard?month=${selectedMonth}&year=${selectedYear}`);
            } else {
              route.push("/dashboard");
            }
          }}
          className="flex items-center gap-3 cursor-pointer"
        >
          <ArrowLeft className="h-7 w-7 text-primary" />
          <h2 className="text-2xl font-bold">Pengeluaran Saya</h2>
        </div>

        <div className="flex gap-2 items-center">
          <EditBudget budgetInfo={budgetInfo} refreshData={() => getBudgetInfo()} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="flex items-center gap-2 px-4 py-2 rounded text-white 
                bg-gradient-to-t from-[#f87171] to-[#b91c1c] 
                hover:brightness-105 hover:shadow-lg 
                transition-all duration-450 ease-in-out">
                <Trash /> Hapus
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                <AlertDialogDescription>
                  Dana dan pengeluaran akan dihapus permanen. Lanjutkan?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Tidak</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteBudget()}>Ya</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 mt-6 gap-5">
        {budgetInfo ? (
          <BudgetItem budget={budgetInfo} />
        ) : (
          <div className="h-[150px] w-full bg-slate-200 rounded-lg animate-pulse" />
        )}

        {user ? (
          <AddExpense danaId={params.id} user={user} refreshData={() => getBudgetInfo()} />
        ) : (
          <div className="h-[150px] w-full bg-slate-200 rounded-lg animate-pulse" />
        )}
      </div>

      <div className="mt-4">
        <h2 className="font-bold text-lg">Pengeluaran Terbaru</h2>
        <ExpenseListTable expensesList={expensesList} refreshData={() => getBudgetInfo()} />
      </div>
    </div>
  );
}

export default Expenses;
