import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
function PricingSection() {
  return (
    <section id="pricing" className="px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Choose Your Power Level
          </h2>
          <p className="text-xl text-gray-300">
            Transparent pricing for every scale of operation
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Starter",
              price: "$0",
              period: "forever",
              description: "Perfect for small projects and testing",
              features: [
                "5 monitored endpoints",
                "1-minute check intervals",
                "Email notifications",
                "7-day data retention",
                "Basic dashboard",
              ],
              popular: false,
            },
            {
              name: "Pro",
              price: "$29",
              period: "per month",
              description: "For growing businesses and teams",
              features: [
                "50 monitored endpoints",
                "30-second check intervals",
                "Multi-channel alerts",
                "90-day data retention",
                "Advanced analytics",
                "Team collaboration",
                "API access",
              ],
              popular: true,
            },
            {
              name: "Enterprise",
              price: "$99",
              period: "per month",
              description: "For mission-critical applications",
              features: [
                "Unlimited endpoints",
                "10-second check intervals",
                "Priority support",
                "1-year data retention",
                "Custom integrations",
                "SLA guarantees",
                "Dedicated account manager",
                "White-label options",
              ],
              popular: false,
            },
          ].map((plan, index) => (
            <Card
              key={index}
              className={`bg-black/50 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:transform hover:scale-105 backdrop-blur-sm relative ${
                plan.popular
                  ? "border-cyan-500/40 shadow-xl shadow-cyan-500/25"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white border-0 shadow-lg">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    <span className="text-gray-400 ml-2">{plan.period}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center text-gray-300"
                    >
                      <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                      : "bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30"
                  } transition-all duration-300`}
                >
                  {plan.name === "Starter" ? "Start Free" : "Get Started"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
