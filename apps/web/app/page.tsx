import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8 mt-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Welcome to your Turborepo with Next.js
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              A modern monorepo setup with Next.js, Tailwind CSS, and shadcn/ui components.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="sm">
              Get Started
            </Button>
            <Button size="lg">
              Get Started
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
            <Button variant="secondary" size="lg">
              Documentation
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl">
            <div className="p-6 border border-border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-2">Turborepo</h3>
              <p className="text-muted-foreground">
                Monorepo build system for JavaScript and TypeScript codebases.
              </p>
            </div>
            <div className="p-6 border border-border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-2">Tailwind CSS</h3>
              <p className="text-muted-foreground">
                Utility-first CSS framework for rapid UI development.
              </p>
            </div>
            <div className="p-6 border border-border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-2">shadcn/ui</h3>
              <p className="text-muted-foreground">
                Beautiful, accessible components built with Radix UI and Tailwind.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
