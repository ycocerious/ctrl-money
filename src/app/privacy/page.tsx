import { Mail } from "lucide-react";
import Link from "next/link";
import { LegalLayout, List, Section } from "~/app/_components/legal";

// Privacy Policy Page
export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      lastUpdated={new Date().toLocaleDateString()}
    >
      <Section title="Introduction">
        <p className="text-gray-600">
          Welcome to Rudy. We respect your privacy and are committed to
          protecting your personal data.
        </p>
      </Section>

      <Section title="Information We Collect">
        <List>
          <li className="flex gap-2">
            <span className="font-medium">Account Information:</span>
            <span>
              When you sign up using Google authentication, we receive your
              email address and name.
            </span>
          </li>
          <li className="flex gap-16">
            <span className="font-medium">Usage Data:</span>
            <span>We collect data about your habits you track in the app.</span>
          </li>
          <li className="flex gap-20">
            <span className="font-medium">Feedback:</span>
            <span>Any feedback or ratings you provide about the app.</span>
          </li>
        </List>
      </Section>

      {/* Additional sections... */}

      <Section title="Contact">
        <div className="flex items-center gap-2 text-gray-600">
          <Mail className="h-5 w-5" />
          <span>For privacy-related questions, please contact us at </span>
          <Link
            href="mailto:tranquilblue91@gmail.com"
            className="text-blue-600 hover:text-blue-700"
          >
            tranquilblue91@gmail.com
          </Link>
        </div>
      </Section>
    </LegalLayout>
  );
}
