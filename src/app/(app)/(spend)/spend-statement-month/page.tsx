"use client";

import { format } from "date-fns";
import { CalendarIcon, Filter, Pencil, Trash2 } from "lucide-react";
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
import type { SpendSelect } from "~/server/db/schema";
import { api } from "~/trpc/react";

export default function SpendStatementMonthPage() {
  const searchParams = useSearchParams();
  const selectedMonth =
    searchParams.get("month") ?? format(new Date(), "yyyy-MM-dd");
  const [isEditSpendOpen, setIsEditSpendOpen] = useState(false);
  const [selectedSpend, setSelectedSpend] = useState<SpendSelect | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // TRPC hooks
  const { data: spendCategories } = api.spend.getSpendCategories.useQuery();
  const { data: spendsForSelectedMonth, isLoading: isLoadingSpends } =
    api.spend.getSpendStatementsForSpecificMonth.useQuery({
      date: selectedMonth,
    });
  const utils = api.useUtils();

  const editSpend = api.spend.editSpend.useMutation({
    onSuccess: async () => {
      toast.success("Spend updated successfully");
      setIsEditSpendOpen(false);
      await utils.spend.getSpendStatementsForSpecificMonth.invalidate();
      await utils.spend.getSpendStatementsForSpecificCategoryAndMonth.invalidate();
      await utils.spend.getTotalSpendForSpecificMonth.invalidate();
      await utils.spend.getTotalSpendForAllCategories.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteSpend = api.spend.deleteSpend.useMutation({
    onSuccess: async () => {
      toast.success("Spend deleted successfully");
      await utils.spend.getSpendStatementsForSpecificMonth.invalidate();
      await utils.spend.getSpendStatementsForSpecificCategoryAndMonth.invalidate();
      await utils.spend.getTotalSpendForSpecificMonth.invalidate();
      await utils.spend.getTotalSpendForAllCategories.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const filteredSpends = spendsForSelectedMonth?.filter(
    (spend) =>
      selectedCategory === "all" || spend.categoryId === selectedCategory,
  );

  const totalSpendForMonth =
    filteredSpends?.reduce((total, spend) => total + spend.amount, 0) ?? 0;

  const handleEditSpend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSpend) return;

    editSpend.mutate({
      id: selectedSpend.id,
      amount: Number(selectedSpend.amount),
      categoryId: selectedSpend.categoryId,
      date: selectedSpend.date,
      name: selectedSpend.name,
    });
  };

  const handleDeleteSpend = (id: string) => {
    if (confirm("Are you sure you want to delete this spend?")) {
      deleteSpend.mutate({ id });
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Monthly Spends Detail */}
      <div className="h-[calc(100vh-120px)] rounded-lg border">
        <div className="bg-background sticky top-0 border-b px-4 pt-4">
          <div className="relative">
            <h2 className="font-semibold">
              Spend Statement - {format(selectedMonth, "MMMM yyyy")}
            </h2>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="absolute top-0 right-0 h-14 w-10">
                <Filter className="h-4 w-4" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {spendCategories
                  ?.map((category) => {
                    const categoryTotal =
                      spendsForSelectedMonth
                        ?.filter((spend) => spend.categoryId === category.id)
                        .reduce((total, spend) => total + spend.amount, 0) ?? 0;

                    return {
                      category,
                      total: categoryTotal,
                    };
                  })
                  .sort((a, b) => b.total - a.total)
                  .map(({ category, total }) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} (₹{total.toLocaleString()})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-start gap-4 pb-4">
            <p className="text-muted-foreground">
              Total:{" "}
              <span className="font-bold">
                ₹{totalSpendForMonth.toLocaleString()}
              </span>
            </p>
            <p className="text-muted-foreground">
              Count: {filteredSpends?.length ?? 0}
            </p>
          </div>
        </div>

        <div className="scrollbar-hide h-[calc(100%-80px)] overflow-y-auto">
          <div className="p-4">
            {isLoadingSpends ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredSpends?.length ? (
              <div className="space-y-3">
                {filteredSpends.map((spend) => {
                  const category = spendCategories?.find(
                    (c) => c.id === spend.categoryId,
                  );
                  return (
                    <div
                      key={spend.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">
                          ₹ {spend.amount.toLocaleString()}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {category?.name} - {spend.name?.slice(0, 30)}
                          {spend.name && spend.name.length > 30 ? "..." : ""}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <div className="mb-1 flex gap-1">
                          <Button
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => {
                              setSelectedSpend(spend);
                              setIsEditSpendOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => handleDeleteSpend(spend.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-muted-foreground text-right text-xs">
                          {new Date(spend.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-muted-foreground">
                  {spendsForSelectedMonth?.length
                    ? "No spends match the current filters."
                    : "No spend entries for this month."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Spend Dialog */}
      <Dialog open={isEditSpendOpen} onOpenChange={setIsEditSpendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Spend</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSpend}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-amount">Amount</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={selectedSpend?.amount ?? 0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (!selectedSpend) return;
                    setSelectedSpend({
                      ...selectedSpend,
                      amount: Number(e.target.value),
                    });
                  }}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={selectedSpend?.name ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (!selectedSpend) return;
                    setSelectedSpend({
                      ...selectedSpend,
                      name: e.target.value,
                    });
                  }}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={selectedSpend?.categoryId ?? ""}
                  onValueChange={(value: string) => {
                    if (!selectedSpend) return;
                    setSelectedSpend({
                      ...selectedSpend,
                      categoryId: value,
                    });
                  }}
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
                        !selectedSpend?.date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedSpend?.date ? (
                        format(new Date(selectedSpend.date), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        selectedSpend?.date
                          ? new Date(selectedSpend.date)
                          : new Date()
                      }
                      defaultMonth={
                        selectedSpend?.date
                          ? new Date(selectedSpend.date)
                          : new Date()
                      }
                      onSelect={(date) => {
                        if (!selectedSpend) return;
                        setSelectedSpend({
                          ...selectedSpend,
                          date: date
                            ? format(date, "yyyy-MM-dd")
                            : format(selectedSpend.date, "yyyy-MM-dd"),
                        });
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={editSpend.isPending}>
                {editSpend.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
