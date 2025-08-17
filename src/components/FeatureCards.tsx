import React from 'react';
import { 
  Bot, 
  Heart, 
  Activity, 
  Brain, 
  Pill, 
  BookOpen, 
  MessageCircle,
  ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, color, delay = '0s' }) => (
    <div
      className="
        feature-card group cursor-pointer animate-fade-in-up
        rounded-2xl border border-border/60 p-5
        transition-all duration-300
        hover:bg-[#f5f3ff] hover:border-purple-200 hover:shadow-lg
        hover:shadow-[0_12px_30px_rgba(139,92,246,0.15)]
      "
      style={{ animationDelay: delay }}
    >
    <div className="flex items-start space-x-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-card-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">{description}</p>
        <Button variant="ghost" size="sm" className="btn-feature p-2 h-auto">
          Learn More
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  </div>
);

const FeatureCards = () => {
  const features = [
    {
      icon: <Bot className="w-6 h-6 text-coral-foreground" />,
      title: 'MedBot Assistant',
      description: 'AI-powered medical guidance available 24/7 in your local language. Get instant answers to health questions with culturally-aware responses.',
      color: 'bg-coral',
      delay: '0.1s'
    },
    {
      icon: <Activity className="w-6 h-6 text-primary-foreground" />,
      title: 'Health Tracking',
      description: 'Comprehensive monitoring of vitals, symptoms, and wellness metrics. Seamlessly track your health journey with intelligent insights.',
      color: 'bg-primary',
      delay: '0.2s'
    },
    {
      icon: <Brain className="w-6 h-6 text-mint-foreground" />,
      title: 'Mental Wellness',
      description: 'Mindfulness exercises, mood tracking, and mental health resources designed for Southeast Asian cultural contexts and needs.',
      color: 'bg-mint',
      delay: '0.3s'
    },
    {
      icon: <Heart className="w-6 h-6 text-coral-foreground" />,
      title: 'MindfulBot',
      description: 'Your personal mental health companion providing guided meditation, stress relief, and emotional support when you need it most.',
      color: 'bg-coral',
      delay: '0.4s'
    },
    {
      icon: <Pill className="w-6 h-6 text-primary-foreground" />,
      title: 'Medication Management',
      description: 'Smart medication reminders, drug interaction checks, and pharmacy locator for all SEA countries with local availability.',
      color: 'bg-primary',
      delay: '0.5s'
    },
    {
      icon: <BookOpen className="w-6 h-6 text-mint-foreground" />,
      title: 'Health Resources',
      description: 'Curated health content, wellness tips, and educational materials tailored for different Southeast Asian communities.',
      color: 'bg-mint',
      delay: '0.6s'
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16 animate-fade-in-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
            Your Health
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-coral ml-3">
              Features
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover powerful tools designed specifically for Southeast Asian healthcare needs, 
            combining cutting-edge AI with cultural understanding.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
              delay={feature.delay}
            />
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 animate-fade-in-up" style={{animationDelay: '0.7s'}}>
          <Button className="btn-hero">
            Explore All Features
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;