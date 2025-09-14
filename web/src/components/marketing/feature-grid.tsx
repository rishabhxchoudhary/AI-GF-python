import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export function FeatureGrid() {
  const features = [
    {
      title: "AI Conversations",
      description: "Natural, engaging conversations powered by advanced AI.",
    },
    {
      title: "Personality",
      description: "Dynamic personality that adapts and grows with you.",
    },
    {
      title: "24/7 Availability",
      description: "Your companion is always there when you need them.",
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
