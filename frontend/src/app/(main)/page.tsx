"use client";

import { Header, HomeHero, HomeCapabilities, HomeCta } from "@/components/pages/(app)";

export default function AppPage() {
  return (
    <div className="min-h-screen bg-main-bg">
      <Header />
      <main className="mx-auto max-w-6xl space-y-6 px-4 pb-20 pt-6 sm:px-8">
        <HomeHero />
        <HomeCapabilities />
        <HomeCta />
      </main>
    </div>
  );
}
