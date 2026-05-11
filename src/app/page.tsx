import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-6 py-16">
      <h1 className="text-2xl font-semibold sm:text-3xl lg:text-4xl">
        Yata Frontend
      </h1>
      <p className="text-base text-muted-foreground sm:text-lg">
        Next.js 14 + Tailwind + shadcn/ui + TanStack Query
      </p>
      <Button>Get started</Button>
    </section>
  );
}
