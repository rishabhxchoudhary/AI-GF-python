import { Button } from "~/components/ui/button";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Ready to Meet Your AI Companion?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join thousands of users who have found their perfect digital
          companion.
        </p>
        <Button asChild size="lg" variant="secondary">
          <Link href="/signup">Start Your Journey</Link>
        </Button>
      </div>
    </section>
  );
}
