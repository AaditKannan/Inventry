'use client';

import Link from "next/link";
import { Package, Rocket, Users, Zap } from 'lucide-react';
import StarryBackground from '@/components/ui/starry-background';

export default function HomePage() {
  return (
    <StarryBackground className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center space-y-8 p-8 max-w-6xl mx-auto">
        <div className="space-y-6">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full animate-float hover:shadow-lg hover:shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-500 hover:scale-110">
              <Package className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
            Inventry
          </h1>
          <p className="text-blue-200 text-lg md:text-xl max-w-2xl mx-auto px-4">
            Community-driven robotics inventory and part lending platform for FTC/robotics teams
          </p>
        </div>
        
        <div className="space-y-6">
          <Link 
            href="/login"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 border border-blue-400/20 hover:border-blue-300/40"
          >
            <Rocket className="w-5 h-5 mr-2" />
            Get Started
          </Link>
          
          <div className="text-sm text-blue-300">
            <p>Join the community of robotics teams sharing parts and resources</p>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto px-4">
          <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-500 hover:scale-105">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-600/20 rounded-full">
                <Package className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Smart Inventory</h3>
            <p className="text-blue-200 text-sm">Track parts, tools, and resources with intelligent organization</p>
          </div>

          <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-500 hover:scale-105">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-600/20 rounded-full">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Team Collaboration</h3>
            <p className="text-blue-200 text-sm">Share resources and collaborate with other robotics teams</p>
          </div>

          <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-500 hover:scale-105">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-600/20 rounded-full">
                <Zap className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Fast Access</h3>
            <p className="text-blue-200 text-sm">Quickly find and request parts when you need them most</p>
          </div>
        </div>
      </div>
    </StarryBackground>
  );
}
