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
import type { SpendCategorySelect } from "~/server/db/schema";
import { api } from "~/trpc/react";

export default function SpendCategoriesPage() {
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
  });
  const [selectedCategory, setSelectedCategory] =
    useState<SpendCategorySelect | null>(null);
  const router = useRouter();

  // TRPC hooks
  const { data: spendCategories, isLoading: isLoadingSpendCategories } =
    api.spend.getSpendCategories.useQuery();
  const { data: totalSpends } =
    api.spend.getTotalSpendForAllCategories.useQuery();
  const utils = api.useUtils();

  const addSpendCategory = api.spend.addSpendCategory.useMutation({
    onSuccess: async () => {
      toast.success("Spend category added successfully");
      setIsAddCategoryOpen(false);
      await utils.spend.getSpendCategories.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const editSpendCategory = api.spend.editSpendCategory.useMutation({
    onSuccess: async () => {
      toast.success("Spend category updated successfully");
      setIsEditCategoryOpen(false);
      await utils.spend.getSpendCategories.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteSpendCategory = api.spend.deleteSpendCategory.useMutation({
    onSuccess: async () => {
      toast.success("Spend category deleted successfully");
      await utils.spend.getSpendCategories.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAddCategory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addSpendCategory.mutate({
      name: newCategory.name,
    });
  };

  const handleEditCategory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCategory) return;

    editSpendCategory.mutate({
      id: selectedCategory.id,
      name: selectedCategory.name,
    });
  };

  const handleDeleteCategory = (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this spend category? This will delete all spend entries associated with it.",
      )
    ) {
      deleteSpendCategory.mutate({ id });
    }
  };

  const getTotalForCategory = (categoryId: string) => {
    const totalSpend = totalSpends?.find(
      (stat) => stat.categoryId === categoryId,
    );
    return totalSpend?.totalAmount ?? 0;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Spend Categories</h1>
        <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Spend Category</DialogTitle>
              <DialogDescription>
                Enter a name for the new spend category.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCategory}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={addSpendCategory.isPending}>
                  {addSpendCategory.isPending ? "Adding..." : "Add Category"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      {isLoadingSpendCategories ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : spendCategories?.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {spendCategories.map((category) => (
            <Card
              key={category.id}
              className="hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() =>
                !isEditCategoryOpen &&
                router.push(
                  `/spend-statement-category?categoryId=${category.id}`,
                )
              }
            >
              <CardHeader>
                <CardTitle className="text-lg">{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{" "}
                  {new Intl.NumberFormat("en-IN", {
                    maximumFractionDigits: 0,
                    style: "decimal",
                  }).format(getTotalForCategory(category.id))}
                </div>
                <p className="text-muted-foreground text-sm">
                  Total spend in this category
                </p>
              </CardContent>
              <CardFooter className="justify-end">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory(category);
                      setIsEditCategoryOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category.id);
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
            No spend categories found. Add your first spend category to get
            started.
          </p>
        </div>
      )}

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Spend Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditCategory}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={selectedCategory?.name ?? ""}
                  onChange={(e) => {
                    if (!selectedCategory) return;
                    setSelectedCategory({
                      ...selectedCategory,
                      name: e.target.value,
                    });
                  }}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={editSpendCategory.isPending}>
                {editSpendCategory.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
