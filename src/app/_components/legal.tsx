import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdated: string;
}

// Shared Layout Component
export const LegalLayout = ({
  children,
  title,
  lastUpdated,
}: LegalLayoutProps) => (
  <div className="min-h-screen bg-gray-50">
    <div className="mx-auto max-w-4xl">
      <nav className="flex items-center p-4 text-sm text-gray-600">
        <Link href="/" className="hover:text-gray-900">
          Home
        </Link>
        <ChevronRight className="mx-2 h-4 w-4" />
        <span className="text-gray-900">{title}</span>
      </nav>

      <div className="rounded-lg bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mb-8 text-sm text-gray-500">
          Last updated: {lastUpdated}
        </p>
        {children}
      </div>

      <footer className="mt-8 p-4 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} Rudy. All rights reserved.
      </footer>
    </div>
  </div>
);

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

// Section Component
export const Section = ({ title, children }: SectionProps) => (
  <section className="mb-8">
    <h2 className="mb-4 text-xl font-semibold text-gray-900">{title}</h2>
    {children}
  </section>
);

interface ListProps {
  children: React.ReactNode;
}

// List Component
export const List = ({ children }: ListProps) => (
  <ul className="ml-6 space-y-3 text-gray-600">{children}</ul>
);
