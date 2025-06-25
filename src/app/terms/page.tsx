import { Mail } from "lucide-react";
import Link from "next/link";
import { LegalLayout, List, Section } from "~/app/_components/legal";

export default function TermsAndConditions() {
  return (
    <LegalLayout
      title="Terms and Conditions"
      lastUpdated={new Date().toLocaleDateString()}
    >
      <Section title="Agreement to Terms">
        <p className="text-gray-600">
          By accessing or using Rudy, you agree to be bound by these Terms and
          Conditions.
        </p>
      </Section>

      <Section title="Account Terms">
        <List>
          <li>You must use a valid Google account to access the service</li>
          <li>You are responsible for maintaining account security</li>
          <li>
            You must not use the service for any illegal or unauthorized purpose
          </li>
        </List>
      </Section>

      {/* Additional sections... */}

      <Section title="Contact">
        <div className="flex items-center gap-2 text-gray-600">
          <Mail className="h-5 w-5" />
          <span>For questions about these terms, please contact </span>
          <Link
            href="mailto:legal@rudy-app.com"
            className="text-blue-600 hover:text-blue-700"
          >
            tranquilblue91@gmail.com
          </Link>
        </div>
      </Section>
    </LegalLayout>
  );
}
