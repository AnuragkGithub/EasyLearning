export type Resource = {
  id: string;
  title: string;
  subject: string;
  unit: string;
  type: "PDF" | "PPT" | "DOC" | "LINK";
  size: string;
  updated: string;
  author: string;
  initials: string;
  color: "lavender" | "mint" | "peach" | "blue";
  category: "Notes" | "Slides" | "Question papers" | "Lab manuals";
  featured?: boolean;
};

export const resources: Resource[] = [
  { id: "r1", title: "Introduction to Data Structures", subject: "Data Structures & Algorithms", unit: "Unit 01 · Foundations", type: "PDF", size: "2.4 MB", updated: "Updated 2h ago", author: "Dr. Priya Sharma", initials: "PS", color: "lavender", category: "Notes", featured: true },
  { id: "r2", title: "DBMS — Normalization & Keys", subject: "Database Management Systems", unit: "Unit 03 · Relational Model", type: "PDF", size: "1.8 MB", updated: "Updated yesterday", author: "Rahul Mehta", initials: "RM", color: "mint", category: "Notes" },
  { id: "r3", title: "Software Process Models", subject: "Software Engineering", unit: "Unit 02 · Process Models", type: "PPT", size: "5.1 MB", updated: "Updated 2 days ago", author: "Prof. A. Banerjee", initials: "AB", color: "peach", category: "Slides" },
  { id: "r4", title: "DSA Mid-semester Practice Set", subject: "Data Structures & Algorithms", unit: "Practice · 25 questions", type: "PDF", size: "860 KB", updated: "Updated 3 days ago", author: "Ananya Das", initials: "AD", color: "blue", category: "Question papers" },
  { id: "r5", title: "SQL Queries — Lab Workbook", subject: "Database Management Systems", unit: "Lab · Experiments 1–6", type: "DOC", size: "1.2 MB", updated: "Updated 4 days ago", author: "Lab Faculty Team", initials: "LF", color: "mint", category: "Lab manuals" },
  { id: "r6", title: "Requirements Engineering — Quick Notes", subject: "Software Engineering", unit: "Unit 01 · Requirements", type: "PDF", size: "1.6 MB", updated: "Updated 5 days ago", author: "Dr. Priya Sharma", initials: "PS", color: "lavender", category: "Notes" },
];

export const subjects = [
  { code: "CSE201", title: "Data Structures & Algorithms", short: "DSA", progress: 68, units: "5 units", tone: "violet", icon: "braces" },
  { code: "CSE203", title: "Database Management Systems", short: "DBMS", progress: 42, units: "6 units", tone: "green", icon: "database" },
  { code: "CSE205", title: "Software Engineering", short: "SE", progress: 84, units: "5 units", tone: "orange", icon: "workflow" },
  { code: "MAT201", title: "Discrete Mathematics", short: "DM", progress: 31, units: "4 units", tone: "blue", icon: "sigma" },
];
