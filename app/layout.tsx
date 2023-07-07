import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tetris",
  description: "A Tetris clone",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
