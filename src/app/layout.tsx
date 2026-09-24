import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const DESCRIPTION =
  "Um caderno digital para estudantes: escreva em blocos, organize por matéria e ligue suas ideias com [[links]]. Grátis e direto no navegador.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sinapse — suas anotações, conectadas como o seu cérebro",
    template: "%s · Sinapse",
  },
  description: DESCRIPTION,
  applicationName: "Sinapse",
  keywords: ["anotações", "notas", "estudantes", "caderno digital", "backlinks", "Notion", "Obsidian"],
  authors: [{ name: "Enzo" }],
  creator: "Enzo",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Sinapse",
    title: "Sinapse — suas anotações, conectadas como o seu cérebro",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Sinapse — suas anotações, conectadas como o seu cérebro",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  // Recomendado pelo BlockNote: o teclado virtual redimensiona o conteúdo no celular.
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
