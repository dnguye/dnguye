import { fontVariables } from "@/lib/fonts";

import "../globals.css";

// Runs before the body paints: the theme comes from the query string, so the
// preview document renders dark (or light) from its very first frame instead
// of flashing the default light tokens until hydration.
const themeScript = `(function(){try{var q=new URLSearchParams(location.search);var dark=q.get("theme")!=="light";var c=document.documentElement.classList;if(dark)c.add("dark");else c.remove("dark");document.documentElement.style.colorScheme=dark?"dark":"light";}catch(e){}})()`;

export default function PreviewLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontVariables} font-sans`}>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
