// src/components/Layout.tsx
import { ReactNode, useState } from 'react';
import DashboardHeader from './DashboardHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, MessageCircle, Settings, BarChart2, Sparkles } from 'lucide-react';
import AIChat from './AIChat';
import AllocationAdjuster from './AllocationAdjuster';
import WhaleTracker from './WhaleTracker';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-900"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-gold-900/5 to-gold-800/10"></div>
        {/* Floating golden orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold-400/5 rounded-full blur-3xl animate-golden-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gold-500/3 rounded-full blur-3xl animate-golden-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-gold-600/4 rounded-full blur-3xl animate-golden-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="relative z-10">
        <DashboardHeader />
        
        <main className="flex-1 container mx-auto py-8 pb-16 px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Enhanced Tab Navigation */}
            <div className="flex justify-center mb-12">
              <div className="relative">
                <TabsList className="bg-charcoal-800/60 backdrop-blur-xl p-2 rounded-2xl shadow-charcoal-deep border border-golden-border">
                  <div className="absolute inset-0 bg-gradient-golden-shimmer bg-[length:200%_100%] animate-shimmer rounded-2xl opacity-30"></div>
                  
                  <TabsTrigger 
                    value="dashboard" 
                    className="relative flex items-center px-6 py-3 rounded-xl font-inter font-medium text-sm transition-all duration-300 data-[state=active]:bg-gradient-golden data-[state=active]:text-charcoal-900 data-[state=active]:shadow-golden-glow data-[state=active]:scale-105 hover:bg-gold-400/10 text-gold-200 hover:text-gold-100"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    <span>Portfolio</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="whales" 
                    className="relative flex items-center px-6 py-3 rounded-xl font-inter font-medium text-sm transition-all duration-300 data-[state=active]:bg-gradient-golden data-[state=active]:text-charcoal-900 data-[state=active]:shadow-golden-glow data-[state=active]:scale-105 hover:bg-gold-400/10 text-gold-200 hover:text-gold-100"
                  >
                    <BarChart2 className="h-4 w-4 mr-2" />
                    <span>Whale Tracker</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="chat" 
                    className="relative flex items-center px-6 py-3 rounded-xl font-inter font-medium text-sm transition-all duration-300 data-[state=active]:bg-gradient-golden data-[state=active]:text-charcoal-900 data-[state=active]:shadow-golden-glow data-[state=active]:scale-105 hover:bg-gold-400/10 text-gold-200 hover:text-gold-100"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    <span>AI Assistant</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="settings" 
                    className="relative flex items-center px-6 py-3 rounded-xl font-inter font-medium text-sm transition-all duration-300 data-[state=active]:bg-gradient-golden data-[state=active]:text-charcoal-900 data-[state=active]:shadow-golden-glow data-[state=active]:scale-105 hover:bg-gold-400/10 text-gold-200 hover:text-gold-100"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Settings</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
            
            {/* Tab Content with enhanced styling */}
            <TabsContent value="dashboard" className="mt-0 outline-none">
              <div className="relative">
                {children}
              </div>
            </TabsContent>
            
            <TabsContent value="whales" className="mt-0 outline-none">
              <div className="relative">
                <WhaleTracker />
              </div>
            </TabsContent>
            
            <TabsContent value="chat" className="mt-0 outline-none">
              <div className="max-w-6xl mx-auto relative">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-golden rounded-2xl shadow-golden-glow mb-4">
                    <Sparkles className="h-8 w-8 text-charcoal-900" />
                  </div>
                  <h2 className="text-3xl font-playfair font-bold golden-text mb-2">AI Assistant</h2>
                  <p className="text-gold-200/80 font-inter">Get personalized insights for your Monad DeFi portfolio</p>
                </div>
                <AIChat />
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-0 outline-none">
              <div className="max-w-4xl mx-auto relative">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-playfair font-bold golden-text mb-2">Portfolio Settings</h2>
                  <p className="text-gold-200/80 font-inter">Customize your investment strategy and risk preferences</p>
                </div>
                <AllocationAdjuster />
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Layout;
