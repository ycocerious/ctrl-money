"use client";

import { addMonths, format, subMonths } from "date-fns";
import {
  AlertTriangle,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
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

export default function DashboardPage() {
  const [selectedMonthForIncome, setSelectedMonthForIncome] = useState(
    new Date(),
  );
  const [selectedMonthForSpend, setSelectedMonthForSpend] = useState(
    new Date(),
  );

  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [newIncome, setNewIncome] = useState({
    amount: 0,
    sourceId: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });

  const [isAddSpendOpen, setIsAddSpendOpen] = useState(false);
  const [newSpend, setNewSpend] = useState({
    amount: 0,
    categoryId: "",
    date: format(
      format(selectedMonthForSpend, "yyyy-MM") === format(new Date(), "yyyy-MM")
        ? new Date()
        : new Date(format(selectedMonthForSpend, "yyyy-MM-01")),
      "yyyy-MM-dd",
    ),
    name: "",
  });

  const [isAddReceivableOpen, setIsAddReceivableOpen] = useState(false);
  const [newReceivable, setNewReceivable] = useState({
    amount: 0,
    name: "",
    purpose: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });

  const router = useRouter();

  // TRPC hooks
  const { data: incomeSources } = api.income.getIncomeSources.useQuery();
  const { data: totalIncomeForMonth, isLoading: isLoadingIncomes } =
    api.income.getTotalIncomeForSpecificMonth.useQuery({
      date: format(selectedMonthForIncome, "yyyy-MM-dd"),
    });
  const { data: spendCategories } = api.spend.getSpendCategories.useQuery();
  const { data: totalSpendForMonth, isLoading: isLoadingSpends } =
    api.spend.getTotalSpendForSpecificMonth.useQuery({
      date: format(selectedMonthForSpend, "yyyy-MM-dd"),
    });
  const { data: totalReceivableAmount, isLoading: isLoadingReceivables } =
    api.receivable.getTotalReceivableAmount.useQuery();
  const utils = api.useUtils();

  const addIncome = api.income.addIncome.useMutation({
    onSuccess: async () => {
      toast.success("Income added successfully");
      setIsAddIncomeOpen(false);
      await utils.income.getTotalIncomeForSpecificMonth.invalidate();
      await utils.income.getIncomeStatementsForSpecificMonth.invalidate();
      await utils.income.getIncomeStatementsForSpecificSource.invalidate();
      setNewIncome({
        amount: 0,
        sourceId: "",
        date: format(new Date(), "yyyy-MM-dd"),
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addSpend = api.spend.addSpend.useMutation({
    onSuccess: async () => {
      toast.success("Spend added successfully");
      setIsAddSpendOpen(false);
      await utils.spend.getTotalSpendForSpecificMonth.invalidate();
      await utils.spend.getSpendStatementsForSpecificMonth.invalidate();
      await utils.spend.getSpendStatementsForSpecificCategoryAndMonth.invalidate();
      setNewSpend({
        amount: 0,
        categoryId: "",
        date: format(
          format(selectedMonthForSpend, "yyyy-MM") ===
            format(new Date(), "yyyy-MM")
            ? new Date()
            : new Date(format(selectedMonthForSpend, "yyyy-MM-01")),
          "yyyy-MM-dd",
        ),
        name: "",
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addReceivable = api.receivable.addReceivable.useMutation({
    onSuccess: async () => {
      toast.success("Receivable added successfully");
      setIsAddReceivableOpen(false);
      await utils.receivable.getTotalReceivableAmount.invalidate();
      setNewReceivable({
        amount: 0,
        name: "",
        purpose: "",
        date: format(new Date(), "yyyy-MM-dd"),
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Handle month navigation
  const prevMonthForIncome = () =>
    setSelectedMonthForIncome(subMonths(selectedMonthForIncome, 1));
  const nextMonthForIncome = () =>
    setSelectedMonthForIncome(addMonths(selectedMonthForIncome, 1));
  const prevMonthForSpend = () =>
    setSelectedMonthForSpend(subMonths(selectedMonthForSpend, 1));
  const nextMonthForSpend = () =>
    setSelectedMonthForSpend(addMonths(selectedMonthForSpend, 1));

  // Handle income form submission
  const handleAddIncome = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addIncome.mutate({
      amount: Number(newIncome.amount),
      sourceId: newIncome.sourceId,
      date: newIncome.date,
    });
  };

  // Handle spend form submission
  const handleAddSpend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addSpend.mutate({
      amount: Number(newSpend.amount),
      categoryId: newSpend.categoryId,
      date: newSpend.date,
      name: newSpend.name,
    });
  };

  // Handle receivable form submission
  const handleAddReceivable = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addReceivable.mutate({
      amount: Number(newReceivable.amount),
      date: newReceivable.date,
      name: newReceivable.name,
      purpose: newReceivable.purpose,
    });
  };

  useEffect(() => {
    setNewSpend((prev) => ({
      ...prev,
      date: format(
        format(selectedMonthForSpend, "yyyy-MM") ===
          format(new Date(), "yyyy-MM")
          ? new Date()
          : new Date(format(selectedMonthForSpend, "yyyy-MM-01")),
        "yyyy-MM-dd",
      ),
    }));
  }, [selectedMonthForSpend]);

  return (
    <div className="p-4 md:p-6">
      {/* Monthly Income Card */}
      <Card
        className="mb-6"
        onClick={() =>
          !isAddIncomeOpen &&
          router.push(
            `/income-statement-month?month=${format(selectedMonthForIncome, "yyyy-MM-dd")}`,
          )
        }
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Monthly Income</CardTitle>
            <CardDescription className="mt-1">
              {format(selectedMonthForIncome, "MMMM yyyy")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                prevMonthForIncome();
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                nextMonthForIncome();
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
              `₹ ${new Intl.NumberFormat("en-IN", {
                maximumFractionDigits: 0,
                style: "decimal",
              }).format(totalIncomeForMonth ?? 0)}`
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Dialog open={isAddIncomeOpen} onOpenChange={setIsAddIncomeOpen}>
            <Button
              className="gap-2"
              onClick={(e) => {
                e.stopPropagation();
                if (!incomeSources || incomeSources.length === 0) {
                  toast(
                    "Please add an income source before adding an income. (See sidebar)",
                    {
                      icon: <AlertTriangle className="h-8 w-8" />,
                      duration: 5000,
                    },
                  );
                } else {
                  setIsAddIncomeOpen(true);
                }
              }}
            >
              <Plus className="h-4 w-4" />
              Add Income
            </Button>
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
                          selected={
                            format(selectedMonthForIncome, "yyyy-MM") ===
                            format(new Date(), "yyyy-MM")
                              ? new Date(newIncome.date)
                              : new Date(
                                  format(selectedMonthForIncome, "yyyy-MM-01"),
                                )
                          }
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

      {/* Monthly Spend Card */}
      <Card
        className="mb-6"
        onClick={() =>
          !isAddSpendOpen &&
          router.push(
            `/spend-statement-month?month=${format(selectedMonthForSpend, "yyyy-MM-dd")}`,
          )
        }
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Monthly Spend</CardTitle>
            <CardDescription className="mt-1">
              {format(selectedMonthForSpend, "MMMM yyyy")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                prevMonthForSpend();
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                nextMonthForSpend();
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {isLoadingSpends ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              `₹ ${new Intl.NumberFormat("en-IN", {
                maximumFractionDigits: 0,
                style: "decimal",
              }).format(totalSpendForMonth ?? 0)}`
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Dialog open={isAddSpendOpen} onOpenChange={setIsAddSpendOpen}>
            <Button
              className="gap-2"
              onClick={(e) => {
                e.stopPropagation();
                if (!spendCategories || spendCategories.length === 0) {
                  toast(
                    "Please add a spend category before adding a spend. (See sidebar)",
                    {
                      icon: <AlertTriangle className="h-8 w-8" />,
                      duration: 5000,
                    },
                  );
                } else {
                  setIsAddSpendOpen(true);
                }
              }}
            >
              <Plus className="h-4 w-4" />
              Add Spend
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Spend</DialogTitle>
                <DialogDescription>
                  Enter the details to add a new spend.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSpend}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newSpend.amount}
                      onChange={(e) =>
                        setNewSpend({
                          ...newSpend,
                          amount: Number(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newSpend.name}
                      onChange={(e) =>
                        setNewSpend({ ...newSpend, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newSpend.categoryId}
                      onValueChange={(value: string) =>
                        setNewSpend({ ...newSpend, categoryId: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a spend category" />
                      </SelectTrigger>
                      <SelectContent>
                        {spendCategories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
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
                            !newSpend.date && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newSpend.date ? (
                            format(new Date(newSpend.date), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={new Date(newSpend.date)}
                          month={selectedMonthForSpend}
                          onSelect={(date) =>
                            setNewSpend({
                              ...newSpend,
                              date: date
                                ? format(date, "yyyy-MM-dd")
                                : newSpend.date,
                            })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={addSpend.isPending}>
                    {addSpend.isPending ? "Adding..." : "Add Spend"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      {/* All Receivables Card */}
      <Card onClick={() => !isAddReceivableOpen && router.push("/receivables")}>
        <CardHeader>
          <CardTitle>All Receivables</CardTitle>
          <CardDescription className="mt-1">
            Total amount to be received
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {isLoadingReceivables ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              `₹ ${new Intl.NumberFormat("en-IN", {
                maximumFractionDigits: 0,
                style: "decimal",
              }).format(Number(totalReceivableAmount) ?? 0)}`
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Dialog
            open={isAddReceivableOpen}
            onOpenChange={setIsAddReceivableOpen}
          >
            <DialogTrigger asChild>
              <Button
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddReceivableOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Receivable
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Receivable</DialogTitle>
                <DialogDescription>
                  Enter the details to add a new receivable.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddReceivable}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newReceivable.amount}
                      onChange={(e) =>
                        setNewReceivable({
                          ...newReceivable,
                          amount: Number(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newReceivable.name}
                      onChange={(e) =>
                        setNewReceivable({
                          ...newReceivable,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="purpose">Purpose</Label>
                    <Input
                      id="purpose"
                      value={newReceivable.purpose}
                      onChange={(e) =>
                        setNewReceivable({
                          ...newReceivable,
                          purpose: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newReceivable.date && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newReceivable.date ? (
                            format(new Date(newReceivable.date), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={new Date(newReceivable.date)}
                          onSelect={(date) =>
                            setNewReceivable({
                              ...newReceivable,
                              date: date
                                ? format(date, "yyyy-MM-dd")
                                : format(
                                    new Date(newReceivable.date),
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
                  <Button type="submit" disabled={addReceivable.isPending}>
                    {addReceivable.isPending ? "Adding..." : "Add Receivable"}
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
