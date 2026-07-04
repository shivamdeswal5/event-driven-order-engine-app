import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { StoreProvider } from "./store-provider";
import { ThemeProvider } from "@/theme/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Apex Console | Distributed Choreography Saga Observability",
  description: "Real-time event choreography, transactional outbox logging, and interactive fault injection control deck.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var t = localStorage.getItem('theme') || 'light';
                document.documentElement.className = t;
                document.documentElement.setAttribute('data-theme', t);
              } catch (e) {}
            })()`,
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans bg-background text-foreground transition-colors duration-300">
        <StoreProvider>
          <ThemeProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
