"use client";

import { format } from "date-fns";
import { CalendarIcon, Pencil, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import type { IncomeSelect } from "~/server/db/schema";
import { api } from "~/trpc/react";

export default function IncomeStatementMonthPage() {
  const searchParams = useSearchParams();
  const selectedMonth =
    searchParams.get("month") ?? format(new Date(), "yyyy-MM-dd");
  const [isEditIncomeOpen, setIsEditIncomeOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<IncomeSelect | null>(
    null,
  );

  // TRPC hooks
  const { data: incomeSources } = api.income.getIncomeSources.useQuery();
  const { data: incomesForSelectedMonth, isLoading: isLoadingIncomes } =
    api.income.getIncomeStatementsForSpecificMonth.useQuery({
      date: selectedMonth,
    });
  const utils = api.useUtils();

  const editIncome = api.income.editIncome.useMutation({
    onSuccess: async () => {
      toast.success("Income updated successfully");
      setIsEditIncomeOpen(false);
      await utils.income.getIncomeStatementsForSpecificMonth.invalidate();
      await utils.income.getIncomeStatementsForSpecificSource.invalidate();
      await utils.income.getTotalIncomeForSpecificMonth.invalidate();
      await utils.income.getAllIncomes.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteIncome = api.income.deleteIncome.useMutation({
    onSuccess: async () => {
      toast.success("Income deleted successfully");
      await utils.income.getIncomeStatementsForSpecificMonth.invalidate();
      await utils.income.getIncomeStatementsForSpecificSource.invalidate();
      await utils.income.getTotalIncomeForSpecificMonth.invalidate();
      await utils.income.getAllIncomes.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const totalIncomeForMonth =
    incomesForSelectedMonth?.reduce(
      (total, income) => total + income.amount,
      0,
    ) ?? 0;

  const handleEditIncome = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedIncome) return;

    editIncome.mutate({
      id: selectedIncome.id,
      amount: Number(selectedIncome.amount),
      sourceId: selectedIncome.sourceId,
      date: selectedIncome.date,
    });
  };

  const handleDeleteIncome = (id: string) => {
    if (confirm("Are you sure you want to delete this income?")) {
      deleteIncome.mutate({ id });
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Monthly Incomes Detail */}
      <div className="h-[calc(100vh-120px)] rounded-lg border">
        <div className="bg-background sticky top-0 border-b px-4 pt-4">
          <h2 className="font-semibold">
            Income Statement - {format(selectedMonth, "MMMM yyyy")}
          </h2>
          <div className="flex justify-between">
            <p className="text-muted-foreground mb-4">
              Total:{" "}
              <span className="font-bold">
                ₹{totalIncomeForMonth.toLocaleString()}
              </span>
            </p>
            <p className="text-muted-foreground">
              Count: {incomesForSelectedMonth?.length ?? 0}
            </p>
          </div>
        </div>

        <div className="scrollbar-hide h-[calc(100%-80px)] overflow-y-auto">
          <div className="p-4">
            {isLoadingIncomes ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : incomesForSelectedMonth?.length ? (
              <div className="space-y-3">
                {incomesForSelectedMonth.map((income) => {
                  const source = incomeSources?.find(
                    (s) => s.id === income.sourceId,
                  );
                  return (
                    <div
                      key={income.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">
                          ₹ {income.amount.toLocaleString()}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {source?.name}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <div className="mb-1 flex gap-1">
                          <Button
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => {
                              setSelectedIncome(income);
                              setIsEditIncomeOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => handleDeleteIncome(income.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-muted-foreground text-right text-xs">
                          {new Date(income.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-muted-foreground">
                  No income entries for this month.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Income Dialog */}
      <Dialog open={isEditIncomeOpen} onOpenChange={setIsEditIncomeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Income</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditIncome}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-amount">Amount</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={selectedIncome?.amount ?? 0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (!selectedIncome) return;
                    setSelectedIncome({
                      ...selectedIncome,
                      amount: Number(e.target.value),
                    });
                  }}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-source">Source</Label>
                <Select
                  value={selectedIncome?.sourceId ?? ""}
                  onValueChange={(value: string) => {
                    if (!selectedIncome) return;
                    setSelectedIncome({
                      ...selectedIncome,
                      sourceId: value,
                    });
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an income source" />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeSources?.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedIncome?.date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedIncome?.date ? (
                        format(new Date(selectedIncome.date), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        selectedIncome?.date
                          ? new Date(selectedIncome.date)
                          : new Date()
                      }
                      defaultMonth={
                        selectedIncome?.date
                          ? new Date(selectedIncome.date)
                          : new Date()
                      }
                      onSelect={(date) => {
                        if (!selectedIncome) return;
                        setSelectedIncome({
                          ...selectedIncome,
                          date: date
                            ? format(date, "yyyy-MM-dd")
                            : format(selectedIncome.date, "yyyy-MM-dd"),
                        });
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={editIncome.isPending}>
                {editIncome.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
