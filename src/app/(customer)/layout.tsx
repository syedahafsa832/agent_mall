import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./agent-mall.css";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`am-root ${inter.className}`}>
      <AuthProvider>{children}</AuthProvider>
    </div>
  );
}
