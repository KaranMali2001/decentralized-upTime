import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
function Testimonials() {
  return (
    <section
      id="testimonials"
      className="px-6 py-20 bg-gradient-to-r from-purple-900/10 to-cyan-900/10"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Trusted by Cyber Warriors
          </h2>
          <p className="text-xl text-gray-300">
            See what our users say about DecentralWatch
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Alex Chen",
              role: "CTO at NeoTech",
              avatar: "/placeholder.svg?height=60&width=60",
              rating: 5,
              text: "DecentralWatch revolutionized our monitoring. The cyberpunk interface isn't just beautiful—it's incredibly functional. Our uptime improved by 40%.",
            },
            {
              name: "Sarah Matrix",
              role: "DevOps Lead at CyberCorp",
              avatar: "/placeholder.svg?height=60&width=60",
              rating: 5,
              text: "The decentralized approach gives us confidence that our monitoring won't fail when we need it most. The real-time alerts saved us millions.",
            },
            {
              name: "Marcus Volt",
              role: "Founder of DataFlow",
              avatar: "/placeholder.svg?height=60&width=60",
              rating: 5,
              text: "Finally, a monitoring solution that matches our tech aesthetic. The blockchain verification gives our clients complete transparency.",
            },
          ].map((testimonial, index) => (
            <Card
              key={index}
              className="bg-black/50 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:transform hover:scale-105 backdrop-blur-sm"
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 border-2 border-purple-500/30"
                  />
                  <div>
                    <h4 className="text-white font-semibold">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-300 italic">"{testimonial.text}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
