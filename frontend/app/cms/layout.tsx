import type { Metadata } from "next";
import "./cms.css";

export const metadata: Metadata = {
  title: "CMS | Dollars & Life",
  robots: { index: false, follow: false },
};

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cms-body" style={{ minHeight: "100vh" }}>
      {children}
    </div>
  );
}
