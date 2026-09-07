import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/legal-layout";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How oneCoreLab collects, uses and protects your information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" updated="1 January 2025">
      <section>
        <h2>Who we are</h2>
        <p>
          oneCoreLab is a software development studio. This policy explains what
          information we collect when you use our website or contact us, why we
          collect it, and what we do with it.
        </p>
      </section>

      <section>
        <h2>Information you give us</h2>
        <p>
          When you submit an enquiry through our contact form or quick
          consultation form, we collect the details you enter — typically your
          name, email address, and a description of your project. We use this
          solely to respond to your enquiry and to discuss potential work.
        </p>
      </section>

      <section>
        <h2>Information collected automatically</h2>
        <p>
          We record basic, first-party analytics: which pages are viewed, which
          projects are opened, and when enquiries are submitted. This is stored
          on our own infrastructure and is used to understand which parts of the
          site are useful. Analytics cookies are only used if you consent to
          them via our cookie banner.
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          Strictly necessary cookies keep the site functioning — for example,
          remembering your cookie choice and keeping staff signed in to the
          admin area. These cannot be switched off. Analytics and preference
          cookies are optional and off by default until you accept them. You can
          change your choice at any time from the &ldquo;Cookie settings&rdquo;
          link in the footer.
        </p>
      </section>

      <section>
        <h2>How we store and share data</h2>
        <p>
          Enquiries are stored in our own database and are accessible only to
          authorised oneCoreLab staff. We do not sell your data, and we do not
          share it with third parties for marketing. Passwords for staff
          accounts are stored only as salted hashes, never in plain text.
        </p>
      </section>

      <section>
        <h2>Retention</h2>
        <p>
          We keep enquiry records for as long as needed to serve you and to keep
          proper business records. You can ask us to delete your enquiry at any
          time.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <ul>
          <li>Ask what personal data we hold about you</li>
          <li>Ask us to correct anything inaccurate</li>
          <li>Ask us to delete your data</li>
          <li>Withdraw cookie consent at any time</li>
        </ul>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          For any privacy question or request, email us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
    </LegalPage>
  );
}
