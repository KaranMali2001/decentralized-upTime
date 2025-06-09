import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <section className="px-6 py-20 bg-gradient-to-r from-purple-900/10 to-cyan-900/10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-300">
            Everything you need to know about DecentralWatch
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              question: "How does decentralized monitoring work?",
              answer:
                "Our network consists of 500+ nodes worldwide that independently monitor your services. Each check is performed by multiple nodes and results are verified through consensus, ensuring accuracy and eliminating single points of failure.",
            },
            {
              question:
                "What makes DecentralWatch different from traditional monitoring?",
              answer:
                "Unlike centralized solutions, DecentralWatch can't go down. Our blockchain-verified results provide immutable proof of your service performance, and our distributed architecture means monitoring continues even if entire data centers fail.",
            },
            {
              question: "How quickly will I be notified of issues?",
              answer:
                "Our fastest plan provides alerts within 10 seconds of detection. Notifications are sent through multiple channels simultaneously to ensure you never miss critical alerts.",
            },
            {
              question:
                "Can I integrate DecentralWatch with my existing tools?",
              answer:
                "Yes! We support integrations with Slack, Discord, PagerDuty, webhooks, and have a comprehensive API. Our team can also build custom integrations for enterprise clients.",
            },
            {
              question: "Is there a free trial available?",
              answer:
                "Absolutely! Our Starter plan is free forever and includes 5 monitored endpoints. You can upgrade anytime as your needs grow.",
            },
          ].map((faq, index) => (
            <Card
              key={index}
              className="bg-black/50 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 backdrop-blur-sm"
            >
              <CardContent className="p-0">
                <button
                  className="w-full p-6 text-left flex items-center justify-between"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <h3 className="text-lg font-semibold text-white">
                    {faq.question}
                  </h3>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-purple-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-purple-400" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
