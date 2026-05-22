import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { SessionHydrator } from "@/components/pages/(app)";
import { Providers } from "./providers";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgentPay SEA",
  description: "AI Agent marketplace with USDC payments on Morph Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var theme = localStorage.getItem("theme-storage");
                  var parsed = theme ? JSON.parse(theme) : null;
                  var mode = parsed && parsed.state && parsed.state.theme ? parsed.state.theme : "light";
                  document.documentElement.setAttribute("data-theme", mode);
                } catch (e) {
                  document.documentElement.setAttribute("data-theme", "light");
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          <SessionHydrator />
          {children}
        </Providers>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
