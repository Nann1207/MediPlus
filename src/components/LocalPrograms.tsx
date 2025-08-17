import React from 'react';
import { MapPin, Calendar, Users, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProgramCardProps {
  country: string;
  flag: string;
  title: string;
  description: string;
  date: string;
  participants: string;
  type: 'campaign' | 'program' | 'workshop';
  delay?: string;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ 
  country, 
  flag, 
  title, 
  description, 
  date, 
  participants, 
  type,
  delay = '0s'
}) => {
  const typeColors = {
    campaign: 'bg-primary text-primary-foreground hover:brightness-110',
    program: 'bg-primary text-primary-foreground hover:brightness-110',
    workshop: 'bg-primary text-primary-foreground hover:brightness-110'
  };

  return (
    <div 
      className="feature-card group cursor-pointer animate-fade-in-up hover:bg-[#f5f3ff] transition-colors duration-300"
      style={{ animationDelay: delay }}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{flag}</span>
            <div>
              <h3 className="font-semibold text-card-foreground">{country}</h3>
              <Badge className={typeColors[type]} variant="secondary">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Badge>
            </div>
          </div>
          <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-card-foreground leading-tight">
            {title}
          </h4>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border/50">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{participants}</span>
          </div>
        </div>

        {/* Action */}
        <Button 
          variant="ghost" 
          className="w-full btn-feature justify-center hover:bg-primary hover:text-white transition-colors duration-200"
        >
          Join Program
        </Button>
      </div>
    </div>
  );
};

const LocalPrograms = () => {
  const programs = [
    {
      country: 'Thailand',
      flag: '🇹🇭',
      title: 'Mental Health Awareness Week',
      description: 'Community-driven mental health support groups and workshops focusing on traditional Thai wellness practices combined with modern therapy techniques.',
      date: 'Mar 15-22, 2024',
      participants: '2.5K+ joined',
      type: 'campaign' as const,
      delay: '0.1s'
    },
    {
      country: 'Singapore',
      flag: '🇸🇬',
      title: 'Diabetes Prevention Program',
      description: 'Comprehensive diabetes screening and prevention program featuring AI-powered health tracking and personalized nutrition plans for Singaporean families.',
      date: 'Ongoing',
      participants: '15K+ enrolled',
      type: 'program' as const,
      delay: '0.2s'
    },
    {
      country: 'Indonesia',
      flag: '🇮🇩',
      title: 'Maternal Health Initiative',
      description: 'Supporting expectant mothers across Indonesia with telemedicine consultations, health tracking, and culturally-sensitive prenatal care guidance.',
      date: 'Jan 10 - Dec 30',
      participants: '8.7K+ mothers',
      type: 'program' as const,
      delay: '0.3s'
    },
    {
      country: 'Malaysia',
      flag: '🇲🇾',
      title: 'Youth Wellness Workshop',
      description: 'Interactive workshops for Malaysian youth focusing on stress management, healthy lifestyle habits, and peer support networks.',
      date: 'Apr 5-7, 2024',
      participants: '1.2K+ youth',
      type: 'workshop' as const,
      delay: '0.4s'
    },
    {
      country: 'Philippines',
      flag: '🇵🇭',
      title: 'Community Health Champions',
      description: 'Training local health advocates to provide basic health education and support in rural Philippine communities using our digital health tools.',
      date: 'Monthly',
      participants: '500+ champions',
      type: 'program' as const,
      delay: '0.5s'
    },
    {
      country: 'Vietnam',
      flag: '🇻🇳',
      title: 'Elder Care Connect',
      description: 'Digital health literacy program for Vietnamese seniors, connecting them with family caregivers and healthcare providers through simple interfaces.',
      date: 'Ongoing',
      participants: '3.8K+ seniors',
      type: 'program' as const,
      delay: '0.6s'
    }
  ];

  return (
    <section className="py-20 bg-[var(--gradient-local)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16 animate-fade-in-up">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <MapPin className="w-8 h-8 text-primary" />
          <h2 className="text-4xl lg:text-5xl font-bold text-primary">
            Local Programmes
          </h2>
        </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join thousands of Southeast Asians in community-driven health and wellness initiatives 
            tailored to your local culture and healthcare needs.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <ProgramCard
              key={index}
              country={program.country}
              flag={program.flag}
              title={program.title}
              description={program.description}
              date={program.date}
              participants={program.participants}
              type={program.type}
              delay={program.delay}
            />
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 animate-fade-in-up" style={{animationDelay: '0.7s'}}>
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-card-foreground mb-4">
              Want to start a program in your community?
            </h3>
            <p className="text-muted-foreground mb-6">
              Connect with local health advocates and start making a difference in your neighborhood.
            </p>
            <Button className="btn-hero">
              Start Community Program
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocalPrograms;
