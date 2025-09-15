import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ThreeScene from "@/components/three-scene";
import Navigation from "@/components/navigation";

export default function Home() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <Navigation />
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold font-space-grotesk">Ludo3 Project</h1>
        <p className="text-lg text-muted-foreground font-inter">
          Next.js + shadcn/ui + Three.js Integration
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>shadcn/ui Components</CardTitle>
            <CardDescription>
              Beautiful, accessible components built with Radix UI and Tailwind CSS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button>Primary Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              These buttons are from shadcn/ui component library, providing consistent
              styling and accessibility features.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Three.js Integration</CardTitle>
            <CardDescription>
              Interactive 3D graphics powered by Three.js and React Three Fiber
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThreeScene />
            <p className="text-sm text-muted-foreground mt-4">
              Interactive 3D scene with a rotating cube. Use mouse to orbit around the scene.
            </p>
          </CardContent>
        </Card>
      </div>

      <main className="flex flex-col gap-[32px] items-center">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Project Setup Complete!</h2>
          <p className="text-muted-foreground max-w-2xl">
            Your Next.js project is now configured with shadcn/ui for beautiful UI components
            and Three.js for 3D graphics. You can start building your Ludo game with these
            powerful tools.
          </p>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Button asChild>
            <a href="/simulate">
              🎲 Ludo Board Simulation
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://ui.shadcn.com/docs"
              target="_blank"
              rel="noopener noreferrer"
            >
              shadcn/ui Docs
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://docs.pmnd.rs/react-three-fiber"
              target="_blank"
              rel="noopener noreferrer"
            >
              React Three Fiber Docs
            </a>
          </Button>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
