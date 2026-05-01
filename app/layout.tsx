import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMEBots. Bots that do the busy work",
  description:
    "Subject Matter Expert bots for project management, product, design, engineering, and more. Automate your workflow with AI. Runs in your browser using your own Anthropic API key.",
  openGraph: {
    title: "SMEBots. Bots that do the busy work",
    description:
      "Subject Matter Expert bots for knowledge workers. Bring your own Anthropic API key — your data never touches our servers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
