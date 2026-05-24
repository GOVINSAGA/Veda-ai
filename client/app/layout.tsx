import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import MobileHeader from "./components/layout/MobileHeader";
import MobileBottomNav from "./components/layout/MobileBottomNav";

export const metadata: Metadata = {
  title: "VedaAI - AI Assessment Creator",
  description: "Create AI-powered question papers for your students",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MobileHeader />
        <div className="app-layout">
          <Sidebar />
          <div className="main-area">
            <TopBar />
            <div className="page-content">{children}</div>
          </div>
        </div>
        <MobileBottomNav />
      </body>
    </html>
  );
}
