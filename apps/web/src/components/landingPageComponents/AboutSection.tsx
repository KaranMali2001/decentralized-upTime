import { Award, Globe, Users } from "lucide-react";
function AboutSection() {
  return (
    <section id="about" className="px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Built for the Future
            </h2>
            <p className="text-xl text-gray-300 mb-6 leading-relaxed">
              DecentralWatch was born from the vision of creating truly reliable
              monitoring infrastructure. Our team of blockchain engineers and
              monitoring experts built a system that can't fail.
            </p>
            <p className="text-gray-400 mb-8">
              With over 500 nodes across 6 continents, we've created the most
              resilient monitoring network ever deployed. Every check is
              verified by multiple nodes and recorded on the blockchain for
              complete transparency and immutability.
            </p>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">50K+</div>
                <div className="text-gray-400 text-sm">Active Users</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">99.99%</div>
                <div className="text-gray-400 text-sm">Network Uptime</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-gray-400 text-sm">Expert Support</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-2xl p-8 backdrop-blur-sm border border-purple-500/20">
              <img
                src="/placeholder.svg?height=400&width=500"
                alt="DecentralWatch Network"
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
