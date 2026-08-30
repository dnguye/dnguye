import { fontVariables } from "@/lib/fonts";

import "../globals.css";

export default function PreviewLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontVariables} font-sans`}>{children}</body>
    </html>
  );
}
