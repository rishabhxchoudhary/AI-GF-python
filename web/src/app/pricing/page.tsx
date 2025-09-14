"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Heart, Check, Coins, Zap, Star, Crown } from "lucide-react";

const pricingPlans = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for trying out AI companionship",
    price: 4.99,
    credits: 10,
    icon: Coins,
    popular: false,
    features: [
      "10 chat messages",
      "Basic personality traits",
      "Simple conversations",
      "30-day credit validity",
    ],
  },
  {
    id: "popular",
    name: "Popular",
    description: "Most popular choice for regular users",
    price: 19.99,
    credits: 50,
    bonus: "20% bonus credits",
    icon: Star,
    popular: true,
    features: [
      "50 + 10 bonus chat messages",
      "Advanced personality system",
      "Relationship progression",
      "Memory & preferences",
      "90-day credit validity",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "For deep, meaningful relationships",
    price: 34.99,
    credits: 100,
    bonus: "30% bonus credits",
    icon: Heart,
    popular: false,
    features: [
      "100 + 30 bonus chat messages",
      "Full personality customization",
      "Advanced relationship stages",
      "Emotional memory system",
      "Inside jokes & references",
      "Priority response time",
      "180-day credit validity",
    ],
  },
  {
    id: "ultimate",
    name: "Ultimate",
    description: "The complete AI girlfriend experience",
    price: 79.99,
    credits: 250,
    bonus: "35% bonus credits",
    icon: Crown,
    popular: false,
    features: [
      "250 + 87 bonus chat messages",
      "Complete personality system",
      "All relationship features",
      "Advanced emotional AI",
      "Proactive conversations",
      "Custom scenarios",
      "Priority support",
      "365-day credit validity",
    ],
  },
];

export default function PricingPage() {
  const handlePurchase = (planId: string) => {
    // TODO: Implement Stripe checkout
    console.log("Purchasing plan:", planId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-pink-500" />
            <span className="font-bold">AI Girlfriend</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signin">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start with our free trial and upgrade when you're ready for more meaningful conversations
          </p>
          <Badge variant="secondary" className="text-sm">
            🎉 New users get 5 free credits to start!
          </Badge>
        </div>

        {/* Pricing Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {pricingPlans.map((plan) => {
            const IconComponent = plan.icon;

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular
                    ? "border-pink-500 shadow-lg scale-105"
                    : "border-border"
                } transition-all duration-300 hover:shadow-lg`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-pink-500 text-white">Most Popular</Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center">
                    <IconComponent className="h-6 w-6 text-pink-500" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold mb-2">
                      ${plan.price}
                    </div>
                    <div className="text-lg font-semibold text-pink-600 mb-1">
                      {plan.credits} Credits
                    </div>
                    {plan.bonus && (
                      <Badge variant="secondary" className="text-xs">
                        {plan.bonus}
                      </Badge>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      ${(plan.price / plan.credits).toFixed(2)} per message
                    </p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-pink-500 hover:bg-pink-600"
                        : ""
                    }`}
                    onClick={() => handlePurchase(plan.id)}
                  >
                    {plan.popular ? (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Get Started
                      </>
                    ) : (
                      "Purchase"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">How do credits work?</h3>
                <p className="text-sm text-muted-foreground">
                  Each message you send costs 1 credit. Credits never expire and you can purchase more anytime.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-sm text-muted-foreground">
                  Credits are one-time purchases, not subscriptions. Use them at your own pace with no recurring charges.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Is my data private?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! All conversations are encrypted and stored securely. We never share your personal data.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">What makes this AI special?</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI learns and evolves with each conversation, developing a unique personality just for you.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-pink-500 to-purple-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                Ready to start your digital relationship?
              </h3>
              <p className="mb-6 opacity-90">
                Join thousands of users who have found their perfect AI companion
              </p>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/auth/signin">
                  Start Free Trial
                </Link>
              </Button>
              <p className="text-sm mt-3 opacity-75">
                5 free credits • No credit card required
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
