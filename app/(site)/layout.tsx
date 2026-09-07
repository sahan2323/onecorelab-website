import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { Intro } from "@/components/sections/intro";
import { ContactActionBar } from "@/components/sections/contact-action-bar";
import { CookieConsent } from "@/components/sections/cookie-consent";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Intro />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <ContactActionBar />
      <CookieConsent />
    </>
  );
}
