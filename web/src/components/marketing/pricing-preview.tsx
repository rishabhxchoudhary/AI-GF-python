import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export function PricingPreview() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Pricing</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Get started for free</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-4">$0</p>
              <ul className="space-y-2 mb-6">
                <li>✓ Basic conversations</li>
                <li>✓ Limited daily chats</li>
              </ul>
              <Button className="w-full">Get Started</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Premium</CardTitle>
              <CardDescription>Full experience</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-4">$9.99/mo</p>
              <ul className="space-y-2 mb-6">
                <li>✓ Unlimited conversations</li>
                <li>✓ Advanced personality</li>
                <li>✓ Premium features</li>
              </ul>
              <Button className="w-full">Upgrade Now</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
