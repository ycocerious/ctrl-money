// app/income-sources/page.tsx
"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "~/components/ui/button";
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
import { Skeleton } from "~/components/ui/skeleton";
import type { IncomeSourceSelect } from "~/server/db/schema";
import { api } from "~/trpc/react";

export default function IncomeSourcesPage() {
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [isEditSourceOpen, setIsEditSourceOpen] = useState(false);
  const [newSource, setNewSource] = useState({
    name: "",
  });
  const [selectedSource, setSelectedSource] =
    useState<IncomeSourceSelect | null>(null);
  const router = useRouter();

  // TRPC hooks
  const { data: incomeSources, isLoading: isLoadingIncomeSources } =
    api.income.getIncomeSources.useQuery();
  const { data: totalIncomes } =
    api.income.getTotalIncomeForAllSources.useQuery();
  const utils = api.useUtils();

  const addIncomeSource = api.income.addIncomeSource.useMutation({
    onSuccess: async () => {
      toast.success("Income source added successfully");
      setIsAddSourceOpen(false);
      await utils.income.getIncomeSources.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const editIncomeSource = api.income.editIncomeSource.useMutation({
    onSuccess: async () => {
      toast.success("Income source updated successfully");
      setIsEditSourceOpen(false);
      await utils.income.getIncomeSources.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteIncomeSource = api.income.deleteIncomeSource.useMutation({
    onSuccess: async () => {
      toast.success("Income source deleted successfully");
      await utils.income.getIncomeSources.invalidate();
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
    const totalIncome = totalIncomes?.find(
      (stat) => stat.sourceId === sourceId,
    );
    return totalIncome?.totalAmount ?? 0;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Income Sources</h1>
        <Dialog open={isAddSourceOpen} onOpenChange={setIsAddSourceOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" /> Add
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
          {totalIncomes?.map((income) => {
            const source = incomeSources?.find((s) => s.id === income.sourceId);
            if (!source) return null;
            return (
              <Card
                key={source.id}
                className="hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() =>
                  !isEditSourceOpen &&
                  router.push(`/income-statement-source?sourceId=${source.id}`)
                }
              >
                <CardHeader>
                  <CardTitle className="text-lg">{source.name}</CardTitle>
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
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">
            No income sources found. Add your first income source to get
            started.
          </p>
        </div>
      )}

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
    </div>
  );
}
