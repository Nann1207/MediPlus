import React, { useState } from "react";
import {
  Heart,
  Phone,
  MessageCircle,
  Shield,
  Brain,
  Headphones,
  Wind,
  HelpCircle,
  Users,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/mental-health-hero.svg";

const MentalHealthResources: React.FC = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [activeButtons, setActiveButtons] = useState<{ [key: string]: "learn" | "resources" | null }>({});

  const sections = [
    { id: "overview", label: "Mental Health Conditions & Resources", icon: Brain },
    { id: "breathing", label: "Breathing Exercises", icon: Wind },
    { id: "music", label: "Calming Music", icon: Headphones },
    { id: "services", label: "Free & Low Cost Services", icon: HelpCircle },
    { id: "crisis", label: "Crisis Support", icon: Phone },
  ];

  const crisisContacts = [
    {
      country: "Singapore",
      service: "Samaritans of Singapore",
      number: "1767",
      hours: "24/7",
      languages: ["English", "Mandarin"],
      hasText: false,
      hasChat: true,
    },
    {
      country: "Malaysia",
      service: "Befrienders KL",
      number: "03-76272929",
      hours: "24/7",
      languages: ["English", "Bahasa Malaysia", "Mandarin", "Tamil"],
      hasText: false,
      hasChat: true,
    },
    {
      country: "Philippines",
      service: "HOPELINE",
      number: "0917-558-4673",
      hours: "24/7",
      languages: ["English", "Filipino"],
      hasText: true,
      hasChat: false,
    },
    {
      country: "Thailand",
      service: "Department of Mental Health",
      number: "1323",
      hours: "24/7",
      languages: ["Thai", "English"],
      hasText: false,
      hasChat: false,
    },
    {
      country: "Indonesia",
      service: "Into The Light Indonesia",
      number: "021-7888-6950",
      hours: "24/7",
      languages: ["Bahasa Indonesia", "English"],
      hasText: true,
      hasChat: true,
    },
    {
      country: "Vietnam",
      service: "Heart 2 Heart",
      number: "1900-599-088",
      hours: "18:00-22:00",
      languages: ["Vietnamese", "English"],
      hasText: false,
      hasChat: true,
    },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF5EC" }}>
      {/* Hero */}
      <section className="relative pt-2 pb-9 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-4 leading-tight">
                Mental Health
                <span className="block bg-gradient-to-r from-primary via-wellness to-secondary bg-clip-text text-transparent">
                  Resources
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-2xl">
                Your mental health matters. In our diverse Southeast Asian communities, seeking help is a sign of
                <span className="text-primary font-semibold"> strength</span>, not weakness.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="text-lg px-8 py-4 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => scrollToSection("overview")}
                >
                  Explore Resources
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 border-primary/40 text-primary hover:bg-primary/10"
                  onClick={() => scrollToSection("crisis")}
                >
                  Get Help Now
                </Button>
              </div>
            </div>
            <div className="flex-1 relative">
              <img src={heroImage} alt="Mental health support illustration" className="w-full h-auto rounded-2xl object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Sticky nav */}
      <section className="sticky top-0 z-50 bg-[#FFF5EC]/90 backdrop-blur border-y border-primary/20">
        <div className="w-full">
          <div
            className="
              flex gap-2 py-4
              overflow-x-auto md:overflow-visible
              whitespace-nowrap md:whitespace-normal
              justify-start md:justify-center
              [-ms-overflow-style:none] [scrollbar-width:none]
              -mx-4 px-4 md:mx-auto
            "
            /* hides scrollbar in WebKit */
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {sections.map((s) => {
              const Icon = s.icon;
              const active = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                    active
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-white text-foreground border border-primary/30 hover:border-primary hover:bg-primary/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>



      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* Overview */}
        <section id="overview" className="animate-fade-in-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Understanding Mental Health</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Mental health affects how we think, feel, and act. It's important at every stage of life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group overflow-hidden rounded-2xl bg-white border-2 border-primary/20 transition-all duration-200 hover:border-primary p-6">
              <div className="text-center">
                <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">What is Mental Health?</h3>
                <p className="text-muted-foreground">
                  Mental health includes emotional, psychological, and social well-being. It affects how we handle
                  stress, relate to others, and make choices.
                </p>
              </div>
            </div>

            <div className="group overflow-hidden rounded-2xl bg-white border-2 border-primary/20 transition-all duration-200 hover:border-primary p-6">
              <div className="text-center">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">You're Not Alone</h3>
                <p className="text-muted-foreground">
                  1 in 4 people in Southeast Asia experience mental health challenges. Seeking help is a sign of
                  strength, not weakness.
                </p>
              </div>
            </div>

            <div className="group overflow-hidden rounded-2xl bg-white border-2 border-primary/20 transition-all duration-200 hover:border-primary p-6">
              <div className="text-center">
                <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">Cultural Understanding</h3>
                <p className="text-muted-foreground">
                  Support that respects our cultural values, family bonds, and community connections.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Conditions */}
        <section id="conditions" className="animate-fade-in-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Mental Health Conditions & Resources</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Understanding common conditions and accessing helpful resources for support and recovery.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                key: "anxiety",
                title: "Anxiety Disorders",
                blurb:
                  "Excessive worry, fear, or nervousness that interferes with daily activities including GAD, social anxiety, and phobias.",
                symptoms:
                  "Racing heart, sweating, restlessness, difficulty concentrating",
              },
              {
                key: "depression",
                title: "Depression",
                blurb:
                  "Persistent feelings of sadness, hopelessness, or loss of interest in activities that can affect daily functioning.",
                symptoms:
                  "Fatigue, sleep changes, appetite changes, feelings of worthlessness",
              },
              {
                key: "panic",
                title: "Panic Disorder",
                blurb:
                  "Sudden episodes of intense fear or discomfort that peak within minutes, often with physical symptoms.",
                symptoms:
                  "Rapid heartbeat, shortness of breath, dizziness, fear of losing control",
              },
              {
                key: "stress",
                title: "Stress Management",
                blurb:
                  "Healthy ways to cope with life's pressures, work demands, and relationship challenges.",
                symptoms: "Irritability, muscle tension, difficulty sleeping, overwhelm",
              },
              {
                key: "bipolar",
                title: "Bipolar Disorder",
                blurb:
                  "Extreme mood swings including emotional highs (mania) and lows (depression) that affect energy and activity.",
                symptoms: "Mood episodes, energy changes, sleep disturbances, impulsivity",
              },
              {
                key: "ptsd",
                title: "PTSD & Trauma",
                blurb:
                  "Triggered by experiencing or witnessing a terrifying event, with lasting emotional effects.",
                symptoms: "Flashbacks, nightmares, severe anxiety, avoidance behaviors",
              },
            ].map((c) => (
              <div
                key={c.key}
                className="group overflow-hidden rounded-2xl bg-white border-2 border-primary/20 transition-all duration-200 hover:border-primary p-6"
              >
                <h3 className="text-xl font-semibold mb-3 text-foreground">{c.title}</h3>
                <p className="text-muted-foreground mb-4 text-sm">{c.blurb}</p>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <p className="text-xs text-primary">
                      <strong>Symptoms:</strong> {c.symptoms}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className={`flex-1 transition-all duration-200 ${
                        activeButtons[`${c.key}-learn`] === "learn"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:border-primary"
                      }`}
                      onClick={() =>
                        setActiveButtons((prev) => ({
                          ...prev,
                          [`${c.key}-learn`]: prev[`${c.key}-learn`] === "learn" ? null : "learn",
                        }))
                      }
                    >
                      Learn More
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`flex-1 transition-all duration-200 ${
                        activeButtons[`${c.key}-resources`] === "resources"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:border-primary"
                      }`}
                      onClick={() =>
                        setActiveButtons((prev) => ({
                          ...prev,
                          [`${c.key}-resources`]:
                            prev[`${c.key}-resources`] === "resources" ? null : "resources",
                        }))
                      }
                    >
                      Resources
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Breathing */}
        <section id="breathing" className="animate-fade-in-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Breathing Exercises</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Simple techniques you can do anywhere to manage anxiety and stress in the moment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "4-7-8 Breathing", desc: "Inhale for 4, hold for 7, exhale for 8. Repeat 3–4 times.", benefit: "Reduces anxiety and promotes sleep" },
              { title: "Box Breathing", desc: "Inhale 4, hold 4, exhale 4, hold 4. Visualize a box.", benefit: "Calms the nervous system" },
              { title: "Belly Breathing", desc: "Hand on belly, breathe slowly and deeply so your hand rises.", benefit: "Activates relaxation response" },
            ].map((b, i) => (
              <div
                key={i}
                className="group overflow-hidden rounded-2xl bg-white border-2 border-primary/20 transition-all duration-200 hover:border-primary p-6 text-center"
              >
                <Wind className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4 text-foreground">{b.title}</h3>
                <p className="text-muted-foreground mb-4">{b.desc}</p>
                <div className="p-3 rounded-lg bg-primary/10">
                  <p className="text-sm text-primary">
                    <strong>Benefit:</strong> {b.benefit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Music */}
        <section id="music" className="animate-fade-in-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Calming Music & Sounds</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Soothing sounds and music to help you relax, focus, and reduce stress.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Nature Sounds", desc: "Rain, ocean waves, forest sounds, and bird songs", tag: "Free on Spotify" },
              { title: "Meditation Music", desc: "Gentle instrumental music for mindfulness and meditation", tag: "YouTube" },
              { title: "Binaural Beats", desc: "Sound frequencies that can help with relaxation and focus", tag: "Apps Available" },
            ].map((m, i) => (
              <div
                key={i}
                className="group overflow-hidden rounded-2xl bg-white border-2 border-primary/20 transition-all duration-200 hover:border-primary p-6"
              >
                <Headphones className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">{m.title}</h3>
                <p className="text-muted-foreground mb-4">{m.desc}</p>
                <Badge variant="outline" className="border-primary/40 text-primary">
                  {m.tag}
                </Badge>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section id="services" className="animate-fade-in-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Free & Low-Cost Services</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Mental health support doesn't have to be expensive. These community resources offer help at little to no cost.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Users,
                title: "Community Health Clinics",
                desc: "Government-subsidized mental health services available in most SEA countries",
                chips: ["In-person", "Varies by location"],
              },
              {
                icon: BookOpen,
                title: "University Counseling Centers",
                desc: "Free or low-cost counseling for students and sometimes community members",
                chips: ["In-person/Online", "Academic year"],
              },
              {
                icon: Heart,
                title: "Religious & Community Support",
                desc: "Temple, mosque, church counseling and community support groups",
                chips: ["In-person", "Ongoing"],
              },
              {
                icon: MessageCircle,
                title: "Online Peer Support Groups",
                desc: "WhatsApp, Telegram, and Facebook groups for mental health support",
                chips: ["Online", "24/7"],
              },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className="group overflow-hidden rounded-2xl bg-white border-2 border-primary/20 transition-all duration-200 hover:border-primary p-6"
                >
                  <Icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{s.title}</h3>
                  <p className="text-muted-foreground mb-4">{s.desc}</p>
                  <div className="flex gap-2">
                    {s.chips.map((c) => (
                      <Badge
                        key={c}
                        variant="outline"
                        className="border-primary/40 text-primary"
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Crisis (kept red) */}
        <section id="crisis" className="animate-fade-in-up">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Shield className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Crisis Support Hotlines</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              If you're in crisis or having thoughts of self-harm, reach out immediately. These services are confidential and here to help.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crisisContacts.map((contact, i) => (
              <div
                key={i}
                className="group overflow-hidden rounded-2xl bg-white border-2 border-red-200 transition-all duration-200 hover:border-red-500 p-6"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{contact.country}</h3>
                    <p className="text-red-600 font-medium">{contact.service}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-red-500" />
                    <span className="font-mono text-lg font-semibold">{contact.number}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-red-300 text-red-700">
                      {contact.hours}
                    </Badge>
                    {contact.hasText && <Badge variant="secondary">Text</Badge>}
                    {contact.hasChat && <Badge variant="secondary">Chat</Badge>}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <strong>Languages:</strong> {contact.languages.join(", ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Uplift */}
        <section className="text-center animate-fade-in-up">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6">You Are Not Alone</h2>
            <blockquote className="text-lg text-muted-foreground italic mb-6 leading-relaxed">
              "Taking care of your mental health is not selfish. It's essential. In our Southeast Asian communities,
              we care for each other — and that includes caring for ourselves. Your wellbeing matters to your family,
              your friends, and your community. Help is available, hope is real, and healing is possible."
            </blockquote>
            <div className="flex justify-center">
              <Heart className="w-8 h-8 text-primary" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MentalHealthResources;
