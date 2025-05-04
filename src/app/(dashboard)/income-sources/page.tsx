// app/income-sources/page.tsx
"use client";

import { format } from "date-fns";
import { CalendarIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Card,
  CardContent,
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
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import type { IncomeSelect, IncomeSourceSelect } from "~/server/db/schema";
import { api } from "~/trpc/react";

export default function IncomeSourcesPage() {
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [isEditSourceOpen, setIsEditSourceOpen] = useState(false);
  const [newSource, setNewSource] = useState({
    name: "",
  });
  const [selectedSource, setSelectedSource] =
    useState<IncomeSourceSelect | null>(null);
  const [showSourceDetails, setShowSourceDetails] = useState(false);
  const [selectedSourceForDetails, setSelectedSourceForDetails] =
    useState<IncomeSourceSelect | null>(null);
  const [isEditIncomeOpen, setIsEditIncomeOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<IncomeSelect | null>(
    null,
  );

  // TRPC hooks
  const { data: incomeSources, isLoading: isLoadingIncomeSources } =
    api.income.getIncomeSources.useQuery();
  const { data: sourceStats } = api.income.getIncomeSourceStats.useQuery();
  const { data: allIncomes, isLoading: isLoadingIncomes } =
    api.income.getIncomes.useQuery();
  const utils = api.useUtils();

  const addIncomeSource = api.income.addIncomeSource.useMutation({
    onSuccess: () => {
      toast.success("Income source added successfully");
      setIsAddSourceOpen(false);
      void utils.income.getIncomeSources.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const editIncomeSource = api.income.editIncomeSource.useMutation({
    onSuccess: () => {
      toast.success("Income source updated successfully");
      setIsEditSourceOpen(false);
      void utils.income.getIncomeSources.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteIncomeSource = api.income.deleteIncomeSource.useMutation({
    onSuccess: () => {
      toast.success("Income source deleted successfully");
      void utils.income.getIncomeSources.invalidate();
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

  const handleAddSource = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addIncomeSource.mutate({
      name: newSource.name,
    });
  };

  const handleEditSource = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSource) return;

    editIncomeSource.mutate({
      id: selectedSource.id,
      name: selectedSource.name,
    });
  };

  const handleDeleteSource = (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this income source? This will delete all income entries associated with it.",
      )
    ) {
      deleteIncomeSource.mutate({ id });
    }
  };

  const getTotalForSource = (sourceId: string) => {
    const stats = sourceStats?.find((stat) => stat.sourceId === sourceId);
    return stats?.totalAmount ?? 0;
  };

  const getIncomesForSource = (sourceId: string) => {
    return allIncomes?.filter((income) => income.sourceId === sourceId) ?? [];
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Income Sources</h1>
        <Dialog open={isAddSourceOpen} onOpenChange={setIsAddSourceOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" /> Add Source
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Income Source</DialogTitle>
              <DialogDescription>
                Enter a name for the new income source.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSource}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newSource.name}
                    onChange={(e) =>
                      setNewSource({ ...newSource, name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={addIncomeSource.isPending}>
                  {addIncomeSource.isPending ? "Adding..." : "Add Source"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sources Grid */}
      {isLoadingIncomeSources ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : incomeSources?.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {incomeSources.map((source) => (
            <Card
              key={source.id}
              className="hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => {
                setSelectedSourceForDetails(source);
                setShowSourceDetails(true);
              }}
            >
              <CardHeader>
                <CardTitle>{source.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{" "}
                  {new Intl.NumberFormat("en-IN", {
                    maximumFractionDigits: 0,
                    style: "decimal",
                  }).format(getTotalForSource(source.id))}
                </div>
                <p className="text-muted-foreground text-sm">
                  Total income from this source
                </p>
              </CardContent>
              <CardFooter className="justify-end">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSource(source);
                      setIsEditSourceOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSource(source.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">
            No income sources found. Add your first income source to get
            started.
          </p>
        </div>
      )}

      {/* Source Details Dialog */}
      <Dialog open={showSourceDetails} onOpenChange={setShowSourceDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Income Details - {selectedSourceForDetails?.name}
            </DialogTitle>
          </DialogHeader>

          {isLoadingIncomes ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : selectedSourceForDetails ? (
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {getIncomesForSource(selectedSourceForDetails.id)
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
                )
                .map((income) => (
                  <div
                    key={income.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">
                        ₹ {income.amount.toLocaleString()}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {format(new Date(income.date), "PPP")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIncome(income);
                          setIsEditIncomeOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSource(income.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-muted-foreground">
                No income entries for this source.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Source Dialog */}
      <Dialog open={isEditSourceOpen} onOpenChange={setIsEditSourceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Income Source</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSource}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={selectedSource?.name ?? ""}
                  onChange={(e) => {
                    if (!selectedSource) return;
                    setSelectedSource({
                      ...selectedSource,
                      name: e.target.value,
                    });
                  }}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={editIncomeSource.isPending}>
                {editIncomeSource.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Income Dialog */}
      <Dialog open={isEditIncomeOpen} onOpenChange={setIsEditIncomeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Income</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedIncome) return;
              editIncome.mutate({
                id: selectedIncome.id,
                amount: selectedIncome.amount,
                sourceId: selectedIncome.sourceId,
                date: selectedIncome.date,
              });
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-amount">Amount</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={selectedIncome?.amount ?? 0}
                  onChange={(e) => {
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
                <Label>Date</Label>
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
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        selectedIncome?.date
                          ? new Date(selectedIncome.date)
                          : undefined
                      }
                      onSelect={(date) => {
                        if (!selectedIncome || !date) return;
                        setSelectedIncome({
                          ...selectedIncome,
                          date: format(date, "yyyy-MM-dd"),
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
