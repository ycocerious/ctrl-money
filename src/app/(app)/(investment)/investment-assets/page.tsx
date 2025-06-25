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
import type { InvestmentAssetSelect } from "~/server/db/schema";
import { api } from "~/trpc/react";

export default function InvestmentAssetsPage() {
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isEditAssetOpen, setIsEditAssetOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: "",
  });
  const [selectedAsset, setSelectedAsset] =
    useState<InvestmentAssetSelect | null>(null);
  const router = useRouter();

  // TRPC hooks
  const { data: investmentAssets, isLoading: isLoadingInvestmentAssets } =
    api.investment.getInvestmentAssets.useQuery();
  const { data: totalInvestments } =
    api.investment.getTotalInvestmentForAllAssets.useQuery();
  const utils = api.useUtils();

  const addInvestmentAsset = api.investment.addInvestmentAsset.useMutation({
    onSuccess: async () => {
      toast.success("Investment asset added successfully");
      setIsAddAssetOpen(false);
      await utils.investment.getInvestmentAssets.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const editInvestmentAsset = api.investment.editInvestmentAsset.useMutation({
    onSuccess: async () => {
      toast.success("Investment asset updated successfully");
      setIsEditAssetOpen(false);
      await utils.investment.getInvestmentAssets.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteInvestmentAsset =
    api.investment.deleteInvestmentAsset.useMutation({
      onSuccess: async () => {
        toast.success("Investment asset deleted successfully");
        await utils.investment.getInvestmentAssets.invalidate();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const handleAddAsset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addInvestmentAsset.mutate({
      name: newAsset.name,
    });
  };

  const handleEditAsset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAsset) return;

    editInvestmentAsset.mutate({
      id: selectedAsset.id,
      name: selectedAsset.name,
    });
  };

  const handleDeleteAsset = (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this investment asset? This will delete all investment entries associated with it.",
      )
    ) {
      deleteInvestmentAsset.mutate({ id });
    }
  };

  const getTotalForAsset = (assetId: string) => {
    const totalInvestment = totalInvestments?.find(
      (stat) => stat.assetId === assetId,
    );
    return totalInvestment?.totalAmount ?? 0;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Investment Assets</h1>
        <Dialog open={isAddAssetOpen} onOpenChange={setIsAddAssetOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Investment Asset</DialogTitle>
              <DialogDescription>
                Enter a name for the new investment asset.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddAsset}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newAsset.name}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={addInvestmentAsset.isPending}>
                  {addInvestmentAsset.isPending ? "Adding..." : "Add Asset"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assets Grid */}
      {isLoadingInvestmentAssets ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : investmentAssets?.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {investmentAssets.map((asset) => (
            <Card
              key={asset.id}
              className="hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() =>
                !isEditAssetOpen &&
                router.push(`/investment-statement-asset?assetId=${asset.id}`)
              }
            >
              <CardHeader>
                <CardTitle className="text-lg">{asset.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{" "}
                  {new Intl.NumberFormat("en-IN", {
                    maximumFractionDigits: 0,
                    style: "decimal",
                  }).format(getTotalForAsset(asset.id))}
                </div>
                <p className="text-muted-foreground text-sm">
                  Total investment in this asset
                </p>
              </CardContent>
              <CardFooter className="justify-end">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAsset(asset);
                      setIsEditAssetOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAsset(asset.id);
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
            No investment assets found. Add your first investment asset to get
            started.
          </p>
        </div>
      )}

      {/* Edit Asset Dialog */}
      <Dialog open={isEditAssetOpen} onOpenChange={setIsEditAssetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Investment Asset</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditAsset}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={selectedAsset?.name ?? ""}
                  onChange={(e) => {
                    if (!selectedAsset) return;
                    setSelectedAsset({
                      ...selectedAsset,
                      name: e.target.value,
                    });
                  }}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={editInvestmentAsset.isPending}>
                {editInvestmentAsset.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
