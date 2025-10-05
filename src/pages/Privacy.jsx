import React from "react";

export default function Privacy() {
  return (
    <div className="p-4 space-y-6 max-w-3xl mx-auto">
      <header className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow">
        <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-300">
          Privacy Policy
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mt-1">
          Last updated: 03 Oct 2025 • This app is a student project/redesign. It
          stores minimal information necessary to sign in and display your data from
          your local demo backend.
        </p>
      </header>

      <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow space-y-4">
        <div>
          <h2 className="font-semibold text-lg">Information we process</h2>
          <ul className="list-disc ml-5 text-gray-700 dark:text-gray-300">
            <li>Login email (and a demo JWT stored in your browser’s localStorage).</li>
            <li>Read-only timetable, calendar events and grades from your demo MySQL.</li>
            <li>Basic device info (via standard web logs) for troubleshooting.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-lg">How we use it</h2>
          <ul className="list-disc ml-5 text-gray-700 dark:text-gray-300">
            <li>Authenticate your session and load your dashboard data.</li>
            <li>Improve reliability and fix bugs.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-lg">Your choices</h2>
          <ul className="list-disc ml-5 text-gray-700 dark:text-gray-300">
            <li>You can sign out at any time (token is removed from localStorage).</li>
            <li>You can request removal of demo data from the local database.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-lg">Data retention</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Demo data is retained only for the duration of this coursework project.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-lg">Contact</h2>
          <p className="text-gray-700 dark:text-gray-300">
            For privacy questions about this demo, contact the project owner.
          </p>
        </div>

        {/* --- ADDED: Security --- */}
        <div>
          <h2 className="font-semibold text-lg">Data security</h2>
          <ul className="list-disc ml-5 text-gray-700 dark:text-gray-300">
            <li>Auth token is stored locally and cleared on sign out.</li>
            <li>No sensitive data is written to the browser beyond what’s required to run the demo.</li>
            <li>If hosted on the web, we recommend HTTPS-only deployment.</li>
          </ul>
        </div>

        {/* --- ADDED: Cookies & Local Storage --- */}
        <div>
          <h2 className="font-semibold text-lg">Cookies & local storage</h2>
          <ul className="list-disc ml-5 text-gray-700 dark:text-gray-300">
            <li><span className="font-medium">localStorage.token</span> — demo login session.</li>
            <li><span className="font-medium">localStorage.darkMode</span> — remembers your theme preference.</li>
          </ul>
        </div>

        {/* --- ADDED: Third-party Services --- */}
        <div>
          <h2 className="font-semibold text-lg">Third-party services</h2>
          <p className="text-gray-700 dark:text-gray-300">
            This app uses open-source libraries (e.g., Tailwind CSS for styling and Swiper for banners).
            They run locally in your browser; no analytics or advertising SDKs are included.
          </p>
        </div>

        {/* --- ADDED: Analytics/Ads --- */}
        <div>
          <h2 className="font-semibold text-lg">Analytics & advertising</h2>
          <p className="text-gray-700 dark:text-gray-300">
            No analytics, tracking pixels, or advertising networks are used in this demo.
          </p>
        </div>

        {/* --- ADDED: Changes --- */}
        <div>
          <h2 className="font-semibold text-lg">Changes to this policy</h2>
          <p className="text-gray-700 dark:text-gray-300">
            We may update this page as the demo evolves. Material changes will update the date at the top.
          </p>
        </div>
      </section>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        This Privacy Policy is provided for a university coursework demo and is not
        legal advice.
      </p>
    </div>
  );
}
