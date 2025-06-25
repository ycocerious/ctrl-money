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
import type { InvestmentSelect } from "~/server/db/schema";
import { api } from "~/trpc/react";

export default function InvestmentStatementMonthPage() {
  const searchParams = useSearchParams();
  const selectedMonth =
    searchParams.get("month") ?? format(new Date(), "yyyy-MM-dd");
  const [isEditInvestmentOpen, setIsEditInvestmentOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] =
    useState<InvestmentSelect | null>(null);

  // TRPC hooks
  const { data: investmentAssets } =
    api.investment.getInvestmentAssets.useQuery();
  const { data: investmentsForSelectedMonth, isLoading: isLoadingInvestments } =
    api.investment.getInvestmentStatementsForSpecificMonth.useQuery({
      date: selectedMonth,
    });
  const utils = api.useUtils();

  const editInvestment = api.investment.editInvestment.useMutation({
    onSuccess: async () => {
      toast.success("Investment updated successfully");
      setIsEditInvestmentOpen(false);
      await utils.investment.getInvestmentStatementsForSpecificMonth.invalidate();
      await utils.investment.getInvestmentStatementsForSpecificAsset.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteInvestment = api.investment.deleteInvestment.useMutation({
    onSuccess: async () => {
      toast.success("Investment deleted successfully");
      await utils.investment.getInvestmentStatementsForSpecificMonth.invalidate();
      await utils.investment.getInvestmentStatementsForSpecificAsset.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const totalInvestmentForMonth =
    investmentsForSelectedMonth?.reduce(
      (total, investment) => total + investment.amount,
      0,
    ) ?? 0;

  const handleEditInvestment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedInvestment) return;

    editInvestment.mutate({
      id: selectedInvestment.id,
      amount: Number(selectedInvestment.amount),
      assetId: selectedInvestment.assetId,
      date: selectedInvestment.date,
      name: selectedInvestment.name,
    });
  };

  const handleDeleteInvestment = (id: string) => {
    if (confirm("Are you sure you want to delete this investment?")) {
      deleteInvestment.mutate({ id });
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Monthly Investments Detail */}
      <div className="h-[calc(100vh-120px)] rounded-lg border">
        <div className="bg-background sticky top-0 border-b px-4 pt-4">
          <h2 className="font-semibold">
            Investment Statement - {format(selectedMonth, "MMMM yyyy")}
          </h2>
          <div className="flex justify-between">
            <p className="text-muted-foreground mb-4">
              Total:{" "}
              <span className="font-bold">
                ₹{totalInvestmentForMonth.toLocaleString()}
              </span>
            </p>
            <p className="text-muted-foreground">
              Count: {investmentsForSelectedMonth?.length ?? 0}
            </p>
          </div>
        </div>

        <div className="scrollbar-hide h-[calc(100%-80px)] overflow-y-auto">
          <div className="p-4">
            {isLoadingInvestments ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : investmentsForSelectedMonth?.length ? (
              <div className="space-y-3">
                {investmentsForSelectedMonth.map((investment) => {
                  const asset = investmentAssets?.find(
                    (a) => a.id === investment.assetId,
                  );
                  return (
                    <div
                      key={investment.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">
                          ₹ {investment.amount.toLocaleString()}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {asset?.name}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <div className="mb-1 flex gap-1">
                          <Button
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => {
                              setSelectedInvestment(investment);
                              setIsEditInvestmentOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() =>
                              handleDeleteInvestment(investment.id)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-muted-foreground text-right text-xs">
                          {new Date(investment.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-muted-foreground">
                  No investment entries for this month.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Investment Dialog */}
      <Dialog
        open={isEditInvestmentOpen}
        onOpenChange={setIsEditInvestmentOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Investment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditInvestment}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-amount">Amount</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={selectedInvestment?.amount ?? 0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (!selectedInvestment) return;
                    setSelectedInvestment({
                      ...selectedInvestment,
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
                  value={selectedInvestment?.name ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (!selectedInvestment) return;
                    setSelectedInvestment({
                      ...selectedInvestment,
                      name: e.target.value,
                    });
                  }}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-asset">Asset</Label>
                <Select
                  value={selectedInvestment?.assetId ?? ""}
                  onValueChange={(value: string) => {
                    if (!selectedInvestment) return;
                    setSelectedInvestment({
                      ...selectedInvestment,
                      assetId: value,
                    });
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an investment asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {investmentAssets?.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name}
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
                        !selectedInvestment?.date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedInvestment?.date ? (
                        format(new Date(selectedInvestment.date), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        selectedInvestment?.date
                          ? new Date(selectedInvestment.date)
                          : new Date()
                      }
                      defaultMonth={
                        selectedInvestment?.date
                          ? new Date(selectedInvestment.date)
                          : new Date()
                      }
                      onSelect={(date) => {
                        if (!selectedInvestment) return;
                        setSelectedInvestment({
                          ...selectedInvestment,
                          date: date
                            ? format(date, "yyyy-MM-dd")
                            : format(selectedInvestment.date, "yyyy-MM-dd"),
                        });
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={editInvestment.isPending}>
                {editInvestment.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
