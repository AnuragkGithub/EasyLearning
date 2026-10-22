import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campusly — Your learning, in one place",
  description: "A student-first academic resource hub for notes, syllabus, lectures and revision across universities.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
