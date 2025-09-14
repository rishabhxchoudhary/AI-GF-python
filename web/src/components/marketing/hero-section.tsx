import { Button } from "~/components/ui/button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="hero-section">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Your Perfect AI Companion
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Experience the future of digital relationships with our advanced AI
            girlfriend.
          </p>
          <Button asChild size="lg">
            <Link href="/chat">Start Chatting</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
