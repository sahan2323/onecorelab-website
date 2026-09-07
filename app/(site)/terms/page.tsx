import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/legal-layout";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that apply when you use the oneCoreLab website and services.",
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms &amp; Conditions" updated="1 January 2025">
      <section>
        <h2>Agreement</h2>
        <p>
          By using this website you agree to these terms. If you do not agree
          with them, please do not use the site.
        </p>
      </section>

      <section>
        <h2>Use of this website</h2>
        <p>
          You may browse and use this site for lawful purposes. You agree not to
          attempt to gain unauthorised access to any part of the site, interfere
          with its operation, or use automated systems to scrape it in a way
          that degrades service for others.
        </p>
      </section>

      <section>
        <h2>Enquiries and quotes</h2>
        <p>
          Submitting an enquiry does not create a contract. Any pricing shown on
          this website is indicative. Work begins only once scope, timeline and
          cost are agreed in writing between you and oneCoreLab.
        </p>
      </section>

      <section>
        <h2>Intellectual property</h2>
        <p>
          The content, design and code of this website belong to oneCoreLab
          unless stated otherwise. Client work shown in our portfolio remains the
          property of the respective clients and is displayed with the intent of
          demonstrating our work. Third-party technology names and logos belong
          to their respective owners.
        </p>
      </section>

      <section>
        <h2>Project terms</h2>
        <ul>
          <li>Scope, deliverables and payment schedule are agreed per project</li>
          <li>Ownership of delivered work transfers on final payment unless agreed otherwise</li>
          <li>Ongoing support and maintenance are covered by a separate agreement</li>
        </ul>
      </section>

      <section>
        <h2>Liability</h2>
        <p>
          This website is provided on an &ldquo;as is&rdquo; basis. We take care
          to keep information accurate but make no warranty that it is complete
          or error-free. To the extent permitted by law, oneCoreLab is not liable
          for indirect or consequential loss arising from use of this website.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          We may update these terms from time to time. The &ldquo;last
          updated&rdquo; date above reflects the current version.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about these terms? Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
    </LegalPage>
  );
}
