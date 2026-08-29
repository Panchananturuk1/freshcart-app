import type { Metadata } from "next";
import Link from "next/link";

import { PRIVACY_URL, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy | FreshCart",
  description:
    "How FreshCart collects, uses, stores, and deletes personal information in the grocery delivery website and Android app.",
  robots: { index: true, follow: true },
};

const PLAY_URL = PRIVACY_URL;
const LAST_UPDATED = "29 August 2026";

const sections = [
  { id: "who-we-are", title: "Who we are" },
  { id: "information-we-collect", title: "Information we collect" },
  { id: "how-we-use", title: "How we use information" },
  { id: "how-we-share", title: "How we share information" },
  { id: "cookies-storage", title: "Cookies and on-device storage" },
  { id: "permissions", title: "Android permissions" },
  { id: "payments", title: "Payments" },
  { id: "retention", title: "Data retention" },
  { id: "security", title: "Security" },
  { id: "your-rights", title: "Your choices and rights" },
  { id: "children", title: "Children" },
  { id: "changes", title: "Changes to this policy" },
  { id: "contact", title: "Contact" },
] as const;

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(163,230,53,0.14),_transparent_26%),linear-gradient(180deg,_#08110a,_#050a06)] text-emerald-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-lime-200/80">FreshCart</p>
        <h1 className="mt-3 font-serif text-4xl text-white sm:text-5xl">Privacy Policy</h1>
        <p className="mt-4 text-sm leading-7 text-emerald-50/74">
          This policy explains how FreshCart handles personal information in the website and the Android app
          (package name <span className="text-white">com.freshcart.android</span>). It is the policy URL you can paste into
          Google Play Console.
        </p>
        <p className="mt-3 text-sm text-emerald-50/60">Last updated: {LAST_UPDATED}</p>
        <p className="mt-2 break-all text-sm text-lime-200/90">{PLAY_URL}</p>

        <nav className="mt-8 rounded-[1.6rem] border border-white/8 bg-white/5 p-5" aria-label="Policy sections">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-100/56">Contents</p>
          <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-lime-200/90 underline-offset-4 hover:underline">
                  {index + 1}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-10 text-sm leading-7 text-emerald-50/78">
          <section id="who-we-are">
            <h2 className="font-serif text-2xl text-white">1. Who we are</h2>
            <p className="mt-3">
              FreshCart is a grocery delivery service operated at{" "}
              <a className="text-lime-200 underline-offset-4 hover:underline" href={SITE_URL}>
                {SITE_URL}
              </a>
              . This policy covers:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>the FreshCart website and APIs hosted at that address</li>
              <li>the FreshCart Android application available through Google Play</li>
            </ul>
          </section>

          <section id="information-we-collect">
            <h2 className="font-serif text-2xl text-white">2. Information we collect</h2>
            <p className="mt-3">We collect information you provide and information needed to run the service:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <span className="font-semibold text-white">Account details:</span> name, email address, phone number, and a
                hashed password. We do not store your password in plain text.
              </li>
              <li>
                <span className="font-semibold text-white">Delivery addresses:</span> label (home, work, other), title,
                street lines, and city.
              </li>
              <li>
                <span className="font-semibold text-white">Orders:</span> products, quantities, prices, chosen payment
                method (UPI, card, or wallet), order status, timestamps, and delivery notes. Assigned rider display name
                and a masked phone number may appear on tracking screens.
              </li>
              <li>
                <span className="font-semibold text-white">Cart and session:</span> items in your cart and which saved
                address you last used.
              </li>
              <li>
                <span className="font-semibold text-white">Technical data:</span> standard HTTPS request logs from our
                hosting provider (IP address, date/time, and browser or app user-agent) used to operate and secure the
                service. We do not use advertising identifiers or analytics SDKs.
              </li>
            </ul>
            <p className="mt-3">
              We do not collect precise location, contacts, photos, SMS, microphone, or calendar data. The Android app
              does not request those permissions.
            </p>
          </section>

          <section id="how-we-use">
            <h2 className="font-serif text-2xl text-white">3. How we use information</h2>
            <p className="mt-3">We use personal information to:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>create and authenticate your account</li>
              <li>save addresses and fulfill grocery orders</li>
              <li>show order history and delivery tracking</li>
              <li>keep you signed in across visits</li>
              <li>protect the service against abuse and fix bugs</li>
            </ul>
            <p className="mt-3">
              We do not sell personal information. We do not use your data for advertising, remarketing, or profiling
              for ads.
            </p>
          </section>

          <section id="how-we-share">
            <h2 className="font-serif text-2xl text-white">4. How we share information</h2>
            <p className="mt-3">
              We share information only as needed to operate FreshCart. Hosting, database, and related infrastructure
              providers (currently Vercel and the database used with this deployment) process data on our behalf under
              their own terms. They are not permitted to use it for their own marketing.
            </p>
            <p className="mt-3">
              We may disclose information if required by law, to respond to a valid legal request, or to protect users
              and the service. We do not share personal information with advertisers or data brokers.
            </p>
          </section>

          <section id="cookies-storage">
            <h2 className="font-serif text-2xl text-white">5. Cookies and on-device storage</h2>
            <p className="mt-3">
              The website uses an HTTP-only session cookie named <span className="text-white">freshcart_session</span>{" "}
              to keep you signed in for up to 7 days. It is set as Secure in production and is not used for advertising.
            </p>
            <p className="mt-3">
              The website also stores a small local snapshot (signed-in profile summary, cart, and selected address id)
              in your browser so the app can restore your session UI. The Android app stores the same kinds of data in
              private app storage (SharedPreferences) plus the session cookie used to call the API.
            </p>
            <p className="mt-3">
              You can clear this data by signing out, clearing site data in your browser, or uninstalling the Android
              app.
            </p>
          </section>

          <section id="permissions">
            <h2 className="font-serif text-2xl text-white">6. Android permissions</h2>
            <p className="mt-3">The Android app requests only:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Internet access, to load the catalog and submit orders</li>
              <li>Network state, to detect connectivity</li>
            </ul>
            <p className="mt-3">
              It does not request location, camera, contacts, SMS, phone, or storage access beyond its own private
              files.
            </p>
          </section>

          <section id="payments">
            <h2 className="font-serif text-2xl text-white">7. Payments</h2>
            <p className="mt-3">
              Checkout records the payment method you select (UPI, card, or wallet). FreshCart does not collect card
              numbers, CVV, UPI PINs, or wallet passwords. If a payment gateway is connected later, that provider will
              process payment credentials under its own privacy policy.
            </p>
          </section>

          <section id="retention">
            <h2 className="font-serif text-2xl text-white">8. Data retention</h2>
            <p className="mt-3">
              Account, address, and order records are kept while your account is active so you can reorder and track
              deliveries. Session cookies expire after 7 days or when you sign out. If you ask us to delete your
              account, we remove or irreversibly de-identify personal data unless a longer period is required by law
              (for example, to keep a record of a completed order).
            </p>
          </section>

          <section id="security">
            <h2 className="font-serif text-2xl text-white">9. Security</h2>
            <p className="mt-3">
              Traffic between the app or website and our servers uses HTTPS. Passwords are stored as hashes. Session
              tokens are signed and sent in an HTTP-only cookie. No method of transmission or storage is completely
              secure, so we cannot guarantee absolute security.
            </p>
          </section>

          <section id="your-rights">
            <h2 className="font-serif text-2xl text-white">10. Your choices and rights</h2>
            <p className="mt-3">You can:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>view and update your name, email, and phone in Account</li>
              <li>add or change delivery addresses</li>
              <li>sign out to end the current session</li>
              <li>request a copy of the personal data we hold about you</li>
              <li>request correction or deletion of your account and associated personal data</li>
            </ul>
            <p className="mt-3">
              To request access or deletion, email the developer contact shown on the FreshCart Google Play listing
              and include the email address on your FreshCart account. We will respond within a reasonable period.
            </p>
          </section>

          <section id="children">
            <h2 className="font-serif text-2xl text-white">11. Children</h2>
            <p className="mt-3">
              FreshCart is not directed at children under 13, and we do not knowingly collect personal information from
              children under 13. If you believe a child has created an account, contact us and we will delete it.
            </p>
          </section>

          <section id="changes">
            <h2 className="font-serif text-2xl text-white">12. Changes to this policy</h2>
            <p className="mt-3">
              We may update this page when the app or our practices change. The “Last updated” date at the top will
              change. Continued use of FreshCart after an update means you accept the revised policy.
            </p>
          </section>

          <section id="contact">
            <h2 className="font-serif text-2xl text-white">13. Contact</h2>
            <p className="mt-3">
              Questions about privacy, data access, or account deletion can be sent to the developer email published on
              the FreshCart Google Play listing. You can also reach us through the website at{" "}
              <a className="text-lime-200 underline-offset-4 hover:underline" href={SITE_URL}>
                {SITE_URL}
              </a>
              .
            </p>
            <p className="mt-3">
              For Google Play Console, use this policy URL:{" "}
              <a className="break-all text-lime-200 underline-offset-4 hover:underline" href={PLAY_URL}>
                {PLAY_URL}
              </a>
            </p>
          </section>
        </div>

        <p className="mt-12">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-4 text-sm font-semibold text-zinc-950"
          >
            Back to FreshCart
          </Link>
        </p>
      </div>
    </div>
  );
}
