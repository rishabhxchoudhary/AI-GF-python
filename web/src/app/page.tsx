import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Heart } from "lucide-react";
import { HeroSection } from "~/components/marketing/hero-section";
import { FeatureGrid } from "~/components/marketing/feature-grid";
import { TestimonialsSection } from "~/components/marketing/testimonials";
import { PricingPreview } from "~/components/marketing/pricing-preview";
import { CTASection } from "~/components/marketing/cta-section";

export default function HomePage() {
  // For now, let's assume no session to simplify the build
  const session = null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center px-4">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Heart className="h-6 w-6 text-pink-500" />
              <span className="hidden font-bold sm:inline-block">
                AI Girlfriend
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href="#features"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Pricing
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Mobile menu can go here */}
            </div>
            <nav className="flex items-center">
              {session ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm">Welcome back!</span>
                  <Button asChild>
                    <Link href="/chat">Chat Now</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" asChild>
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth/signin">Get Started</Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <HeroSection />
        <FeatureGrid />
        <TestimonialsSection />
        <PricingPreview />
        <CTASection />
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:h-24 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Heart className="h-6 w-6 text-pink-500" />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built with love for digital relationships.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
