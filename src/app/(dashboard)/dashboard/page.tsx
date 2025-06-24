"use client";

import { addMonths, format, subMonths } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
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
import { api } from "~/trpc/react";
import { useStore } from "~/zustand/store";

export default function DashboardPage() {
  const currentMonth = useStore((state) => state.currentMonth);
  const setCurrentMonth = useStore((state) => state.setCurrentMonth);

  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [newIncome, setNewIncome] = useState({
    amount: 0,
    sourceId: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });
  const router = useRouter();

  // TRPC hooks
  const { data: incomeSources } = api.income.getIncomeSources.useQuery();
  const { data: totalIncomeForMonth, isLoading: isLoadingIncomes } =
    api.income.getTotalIncomeForSpecificMonth.useQuery({
      date: format(currentMonth, "yyyy-MM-dd"),
    });
  const utils = api.useUtils();

  const addIncome = api.income.addIncome.useMutation({
    onSuccess: async () => {
      toast.success("Income added successfully");
      setIsAddIncomeOpen(false);
      await utils.income.getTotalIncomeForSpecificMonth.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Handle month navigation
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Handle income form submission
  const handleAddIncome = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addIncome.mutate({
      amount: Number(newIncome.amount),
      sourceId: newIncome.sourceId,
      date: newIncome.date,
    });
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!isAddIncomeOpen) {
      setNewIncome({
        amount: 0,
        sourceId: "",
        date: format(new Date(), "yyyy-MM-dd"),
      });
    }
  }, [isAddIncomeOpen]);

  return (
    <div className="p-4 md:p-6">
      <h1 className="mb-4 text-xl font-bold">Dashboard</h1>

      {/* Monthly Income Card */}
      <Card
        className="mb-8"
        onClick={() => !isAddIncomeOpen && router.push("/income-statement")}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Monthly Income</CardTitle>
            <CardDescription className="mt-1">
              {format(currentMonth, "MMMM yyyy")}
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
              `₹ ${totalIncomeForMonth?.toLocaleString()}`
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
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newIncome.date && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newIncome.date ? (
                            format(new Date(newIncome.date), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={new Date(newIncome.date)}
                          onSelect={(date) =>
                            setNewIncome({
                              ...newIncome,
                              date: date
                                ? format(date, "yyyy-MM-dd")
                                : format(
                                    new Date(newIncome.date),
                                    "yyyy-MM-dd",
                                  ),
                            })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
    </div>
  );
}
