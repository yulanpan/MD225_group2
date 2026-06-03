import type { Metadata } from "next";
import "./globals.css";
import { AudioProvider } from "./audio-provider";
import MotionBootstrap from "./motion-bootstrap";
import MotionProvider from "./motion-provider";

export const metadata: Metadata = {
  title: "The Emperor's Feed",
  description: "An AI-mediated interactive adaptation of The Emperor's New Clothes.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.ico"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <MotionProvider>
          <AudioProvider>{children}</AudioProvider>
        </MotionProvider>
        <MotionBootstrap />
      </body>
    </html>
  );
}
