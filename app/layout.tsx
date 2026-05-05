import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SyncSpace",
  description: "SyncSpace is a collaborative code editor that allows multiple users to edit code in real-time. It supports syntax highlighting, code formatting, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {children}
        <Toaster
        position="top-right"
        reverseOrder={false}
        containerClassName="z-50"
        toastOptions={{
          duration: 3000,
          className: "text-xs",
          style: {
            background: "#161b22",
            color: "#e5e7eb",
            border: "1px solid #34d39666",
            borderRadius: "4px",
            padding: "8px 12px",
            fontSize: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            fontFamily: "'JetBrains Mono', monospace",
          },
        }}
      />
      </body>
    </html>
  );
}
