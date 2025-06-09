import { Card, CardContent } from "@/components/ui/card";
import {
  Activity,
  CheckCircle,
  Globe,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
function FeatureSection() {
  return (
    <section
      id="features"
      className="px-6 py-20 bg-gradient-to-r from-purple-900/10 to-cyan-900/10"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Next-Gen Monitoring Features
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: "Decentralized Network",
              description:
                "Monitor from 500+ global nodes for maximum reliability and accuracy",
            },
            {
              icon: Zap,
              title: "Real-time Alerts",
              description:
                "Instant notifications via Slack, Discord, email, and webhooks",
            },
            {
              icon: Globe,
              title: "Global Coverage",
              description:
                "Monitor from every continent with sub-50ms response times",
            },
            {
              icon: TrendingUp,
              title: "Advanced Analytics",
              description:
                "Deep insights with performance trends and historical data",
            },
            {
              icon: CheckCircle,
              title: "99.9% SLA",
              description:
                "Enterprise-grade reliability with blockchain verification",
            },
            {
              icon: Activity,
              title: "Custom Dashboards",
              description:
                "Beautiful, customizable dashboards for your entire team",
            },
          ].map((feature, index) => (
            <Card
              key={index}
              className="bg-black/50 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:transform hover:scale-105 group backdrop-blur-sm"
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureSection;
