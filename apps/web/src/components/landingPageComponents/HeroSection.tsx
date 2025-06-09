"use client";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";
import Link from "next/link";
function HeroSection() {
  return (
    <section className="px-6 py-20 text-center">
      <div className="max-w-6xl mx-auto">
        <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30 transition-all duration-300">
          <Zap className="w-3 h-3 mr-1" />
          Powered by Blockchain Technology
        </Badge>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
            Decentralized
          </span>
          <br />
          <span className="text-white">Uptime Monitoring</span>
        </h1>

        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Monitor your services across a distributed network of nodes. Get
          real-time alerts, comprehensive analytics, and 99.9% reliability with
          our blockchain-powered infrastructure.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href={"/sign-in"}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0 shadow-xl shadow-purple-500/25 transform hover:scale-105 transition-all duration-300"
          >
            Start Monitoring Free
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 transition-all duration-300"
          >
            View Demo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          {[
            { label: "Uptime", value: "99.9%" },
            { label: "Global Nodes", value: "500+" },
            { label: "Monitored Sites", value: "10K+" },
            { label: "Response Time", value: "<50ms" },
          ].map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
