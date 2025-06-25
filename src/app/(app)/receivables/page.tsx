"use client";

import { format } from "date-fns";
import { CalendarIcon, Pencil, Trash2 } from "lucide-react";
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
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import type { ReceivableSelect } from "~/server/db/schema";
import { api } from "~/trpc/react";

export default function ReceivablesPage() {
  const [isEditReceivableOpen, setIsEditReceivableOpen] = useState(false);
  const [selectedReceivable, setSelectedReceivable] =
    useState<ReceivableSelect | null>(null);

  // TRPC hooks
  const { data: receivables, isLoading: isLoadingReceivables } =
    api.receivable.getAllReceivables.useQuery();
  const utils = api.useUtils();

  const editReceivable = api.receivable.editReceivable.useMutation({
    onSuccess: async () => {
      toast.success("Receivable updated successfully");
      setIsEditReceivableOpen(false);
      await utils.receivable.getAllReceivables.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteReceivable = api.receivable.deleteReceivable.useMutation({
    onSuccess: async () => {
      toast.success("Receivable deleted successfully");
      await utils.receivable.getAllReceivables.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const totalReceivableAmount =
    receivables?.reduce((total, receivable) => total + receivable.amount, 0) ??
    0;

  const handleEditReceivable = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedReceivable) return;

    editReceivable.mutate({
      id: selectedReceivable.id,
      amount: Number(selectedReceivable.amount),
      name: selectedReceivable.name,
      purpose: selectedReceivable.purpose,
      date: selectedReceivable.date,
    });
  };

  const handleDeleteReceivable = (id: string) => {
    if (confirm("Are you sure you want to delete this receivable?")) {
      deleteReceivable.mutate({ id });
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* All Receivables Detail */}
      <div className="h-[calc(100vh-120px)] rounded-lg border">
        <div className="bg-background sticky top-0 border-b px-4 pt-4">
          <h2 className="font-semibold">All Receivables</h2>
          <div className="flex justify-between">
            <p className="text-muted-foreground mb-4">
              Total:{" "}
              <span className="font-bold">
                ₹{totalReceivableAmount.toLocaleString()}
              </span>
            </p>
            <p className="text-muted-foreground">
              Count: {receivables?.length ?? 0}
            </p>
          </div>
        </div>

        <div className="scrollbar-hide h-[calc(100%-80px)] overflow-y-auto">
          <div className="p-4">
            {isLoadingReceivables ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : receivables?.length ? (
              <div className="space-y-3">
                {receivables.map((receivable) => {
                  return (
                    <div
                      key={receivable.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">
                          ₹ {receivable.amount.toLocaleString()}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {receivable.name} - {receivable.purpose}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <div className="mb-1 flex gap-1">
                          <Button
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => {
                              setSelectedReceivable(receivable);
                              setIsEditReceivableOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() =>
                              handleDeleteReceivable(receivable.id)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-muted-foreground text-right text-xs">
                          {new Date(receivable.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-muted-foreground">No receivables found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Receivable Dialog */}
      <Dialog
        open={isEditReceivableOpen}
        onOpenChange={setIsEditReceivableOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Receivable</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditReceivable}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-amount">Amount</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={selectedReceivable?.amount ?? 0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (!selectedReceivable) return;
                    setSelectedReceivable({
                      ...selectedReceivable,
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
                  value={selectedReceivable?.name ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (!selectedReceivable) return;
                    setSelectedReceivable({
                      ...selectedReceivable,
                      name: e.target.value,
                    });
                  }}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-purpose">Purpose</Label>
                <Input
                  id="edit-purpose"
                  value={selectedReceivable?.purpose ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (!selectedReceivable) return;
                    setSelectedReceivable({
                      ...selectedReceivable,
                      purpose: e.target.value,
                    });
                  }}
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
                        !selectedReceivable?.date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedReceivable?.date ? (
                        format(new Date(selectedReceivable.date), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        selectedReceivable?.date
                          ? new Date(selectedReceivable.date)
                          : new Date()
                      }
                      defaultMonth={
                        selectedReceivable?.date
                          ? new Date(selectedReceivable.date)
                          : new Date()
                      }
                      onSelect={(date) => {
                        if (!selectedReceivable) return;
                        setSelectedReceivable({
                          ...selectedReceivable,
                          date: date
                            ? format(date, "yyyy-MM-dd")
                            : format(selectedReceivable.date, "yyyy-MM-dd"),
                        });
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={editReceivable.isPending}>
                {editReceivable.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
