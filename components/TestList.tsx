import TestCard, { TestItem } from "@/components/TestCard";

export default function TestList() {
  const tests: TestItem[] = [
    {
      id: 1,
      name: "JavaScript Basics",
      active: true,
      createdAt: "23 Sep 2026",
    },
    {
      id: 2,
      name: "React Advanced",
      active: false,
      createdAt: "20 Sep 2026",
    },
  ];

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-4">
      {tests.map((test) => (
        <TestCard key={test.id} test={test} />
      ))}
    </section>
  );
}
