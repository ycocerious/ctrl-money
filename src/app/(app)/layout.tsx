// app/(dashboard)/layout.tsx
"use client";

import { Home, LayoutDashboard, Menu, PieChart, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { cn } from "~/lib/utils";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Income Sources",
    href: "/income-sources",
    icon: <PieChart className="h-5 w-5" />,
  },
  {
    title: "Spend Categories",
    href: "/spend-categories",
    icon: <Wallet className="h-5 w-5" />,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Use this to prevent hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="bg-card border-border hidden w-64 flex-col border-r lg:flex">
        <div className="p-6">
          <h1 className="text-xl font-bold">Ctrl.Money</h1>
        </div>
        <div className="flex-1 px-4">
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <div className="bg-background fixed top-0 right-0 left-0 z-40 flex items-center justify-between border-b p-4 lg:hidden">
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Ctrl.Money"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <h1 className="text-xl font-bold">Ctrl.Money</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              asChild
              aria-label="Go to Dashboard"
            >
              <Link href="/dashboard">
                <Home className="size-6" />
                <span className="sr-only">Home</span>
              </Link>
            </Button>
          </div>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="p-6 pb-0">
            <h1 className="text-xl font-bold">Ctrl.Money</h1>
          </div>
          <div className="px-4">
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground",
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4 pt-22 lg:p-6 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
