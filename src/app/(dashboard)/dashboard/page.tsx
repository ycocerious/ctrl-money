"use client";

import { addMonths, format, isSameMonth, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { formatDateToYYYYMMDD } from "~/lib/utils/format-date";
import type { IncomeSelect } from "~/server/db/schema";
import { api } from "~/trpc/react";

export default function DashboardPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showIncomesForMonth, setShowIncomesForMonth] = useState(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isEditIncomeOpen, setIsEditIncomeOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<IncomeSelect | null>(
    null,
  );
  const [newIncome, setNewIncome] = useState({
    amount: 0,
    sourceId: "",
    addedAt: new Date(),
  });

  // TRPC hooks
  const { data: incomeSources } = api.income.getIncomeSources.useQuery();
  const { data: incomes, isLoading: isLoadingIncomes } =
    api.income.getIncomes.useQuery();
  const utils = api.useUtils();

  const addIncome = api.income.addIncome.useMutation({
    onSuccess: () => {
      toast.success("Income added successfully");
      setIsAddIncomeOpen(false);
      void utils.income.getIncomes.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const editIncome = api.income.editIncome.useMutation({
    onSuccess: () => {
      toast.success("Income updated successfully");
      setIsEditIncomeOpen(false);
      void utils.income.getIncomes.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteIncome = api.income.deleteIncome.useMutation({
    onSuccess: () => {
      toast.success("Income deleted successfully");
      void utils.income.getIncomes.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Filter incomes for current month
  const incomesForCurrentMonth = incomes?.filter((income) =>
    isSameMonth(new Date(income.addedAt), currentMonth),
  );

  // Update the total calculation to use filtered incomes
  const totalIncomeForMonth =
    incomesForCurrentMonth?.reduce(
      (total, income) => total + income.amount,
      0,
    ) ?? 0;

  // Handle month navigation
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Handle income form submission
  const handleAddIncome = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const today = new Date();
    const formattedDate = formatDateToYYYYMMDD(today.toString());
    addIncome.mutate({
      amount: Number(newIncome.amount),
      sourceId: newIncome.sourceId,
      addedAt: formattedDate,
    });
  };

  const handleEditIncome = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedIncome) return;

    editIncome.mutate({
      id: selectedIncome.id,
      amount: Number(selectedIncome.amount),
      sourceId: selectedIncome.sourceId,
    });
  };

  const handleDeleteIncome = (id: string) => {
    if (confirm("Are you sure you want to delete this income?")) {
      deleteIncome.mutate({ id });
    }
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!isAddIncomeOpen) {
      setNewIncome({
        amount: 0,
        sourceId: "",
        addedAt: new Date(),
      });
    }
  }, [isAddIncomeOpen]);

  return (
    <div className="p-4 md:p-6">
      {/* Monthly Income Card */}
      <Card
        className="mb-8"
        onClick={() => !isAddIncomeOpen && setShowIncomesForMonth(true)}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Monthly Income</CardTitle>
            <CardDescription>
              Total income for {format(currentMonth, "MMMM yyyy")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                prevMonth();
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                nextMonth();
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {isLoadingIncomes ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              `₹ ${totalIncomeForMonth.toLocaleString()}`
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Dialog open={isAddIncomeOpen} onOpenChange={setIsAddIncomeOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddIncomeOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> Add Income
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Income</DialogTitle>
                <DialogDescription>
                  Enter the details to add a new income.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddIncome}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newIncome.amount}
                      onChange={(e) =>
                        setNewIncome({
                          ...newIncome,
                          amount: Number(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="source">Source</Label>
                    <Select
                      value={newIncome.sourceId}
                      onValueChange={(value: string) =>
                        setNewIncome({ ...newIncome, sourceId: value })
                      }
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
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={addIncome.isPending}>
                    {addIncome.isPending ? "Adding..." : "Add Income"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      {/* Monthly Incomes Detail */}
      <Dialog open={showIncomesForMonth} onOpenChange={setShowIncomesForMonth}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Income Details - {format(currentMonth, "MMMM yyyy")}
            </DialogTitle>
            <DialogDescription>
              All income entries for this month.
            </DialogDescription>
          </DialogHeader>

          {isLoadingIncomes ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : incomesForCurrentMonth?.length ? (
            <div className="max-h-96 overflow-y-auto">
              {incomesForCurrentMonth.map((income) => {
                const source = incomeSources?.find(
                  (s) => s.id === income.sourceId,
                );
                return (
                  <div
                    key={income.id}
                    className="mb-2 flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">
                        ₹{income.amount.toLocaleString()}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {source?.name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedIncome(income);
                          setIsEditIncomeOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteIncome(income.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
        </DialogContent>
      </Dialog>

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
                      id: selectedIncome.id,
                      amount: Number(e.target.value),
                      sourceId: selectedIncome.sourceId,
                      addedAt: selectedIncome.addedAt,
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
                      id: selectedIncome.id,
                      amount: selectedIncome.amount,
                      sourceId: value,
                      addedAt: selectedIncome.addedAt,
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
