import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StudyOS God Mode // Developer Kernel",
  description: "Exclusive control plane and diagnostic hub for StudyOS creator.",
  robots: "noindex, nofollow",
};

export default function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="dark antialiased bg-[#07040f]">{children}</div>;
}
