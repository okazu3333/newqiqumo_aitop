import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { Footer } from "./_components/footer";
import { TRPCProvider } from "./providers";

export const metadata: Metadata = {
  title: "Survey PoC",
  description: "Survey Proof of Concept",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">
        <TRPCProvider>
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </TRPCProvider>
      </body>
    </html>
  );
}
