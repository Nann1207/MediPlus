import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Heart,
  Leaf,
  Star,
  ArrowRight,
  Calendar,
  Users,
  Clock,
  Brain,
  Play,
  Target,
} from "lucide-react";
import exerciseHero from "@/assets/exercise-hero.jpg";
import meditationHero from "@/assets/meditation-hero.jpg";
import exercisebackground from "@/assets/exercisebackground.png";

/* ----------------------------- Data: Exercise ----------------------------- */
const exercisePrograms = [
  { id: 1, name: "HIIT Cardio Blast", description: "High-intensity interval training to boost your metabolism and burn calories effectively.", duration: "30 min", difficulty: "Advanced", participants: "1-15", equipment: "Body weight", benefits: ["Burns calories", "Improves cardio", "Builds endurance"], rating: 4.8 },
  { id: 2, name: "Strength Training", description: "Build muscle mass with resistance training using weights and equipment.", duration: "45 min", difficulty: "Intermediate", participants: "1-10", equipment: "Dumbbells, Bands", benefits: ["Builds muscle", "Increases strength", "Improves bone density"], rating: 4.9 },
  { id: 3, name: "Yoga Flow", description: "Gentle flowing movements that improve flexibility, balance, and mindful breathing.", duration: "60 min", difficulty: "Beginner", participants: "1-20", equipment: "Yoga mat", benefits: ["Improves flexibility", "Reduces stress", "Enhances balance"], rating: 4.7 },
  { id: 4, name: "Pilates Core", description: "Focused core strengthening exercises that improve posture and stability.", duration: "40 min", difficulty: "Intermediate", participants: "1-12", equipment: "Mat, Props", benefits: ["Strengthens core", "Improves posture", "Increases stability"], rating: 4.8 },
  { id: 5, name: "Dance Fitness", description: "Fun, energetic dance routines that make exercise feel like a celebration.", duration: "50 min", difficulty: "All levels", participants: "5-25", equipment: "None", benefits: ["Burns calories", "Improves coordination", "Boosts mood"], rating: 4.9 },
  { id: 6, name: "Aqua Fitness", description: "Low-impact water-based exercises perfect for joint-friendly workouts.", duration: "45 min", difficulty: "All levels", participants: "5-15", equipment: "Pool equipment", benefits: ["Low impact", "Full body workout", "Joint friendly"], rating: 4.6 },
];

/* ----------------------------- Data: Wellness ----------------------------- */
const wellnessPrograms = [
  { id: 1, name: "Mindful Meditation", description: "Guided meditation sessions to reduce stress, improve focus, and cultivate inner peace through mindfulness practices.", duration: "20 min", type: "Meditation", level: "All levels", benefits: ["Reduces stress", "Improves focus", "Enhances well-being"], sessions: 12, rating: 4.9 },
  { id: 2, name: "Breathing Techniques", description: "Learn powerful breathing methods to manage anxiety, increase energy, and promote relaxation.", duration: "15 min", type: "Breathwork", level: "Beginner", benefits: ["Manages anxiety", "Increases energy", "Promotes relaxation"], sessions: 8, rating: 4.8 },
  { id: 3, name: "Body Scan Relaxation", description: "Progressive muscle relaxation and body awareness techniques for deep physical and mental restoration.", duration: "30 min", type: "Relaxation", level: "All levels", benefits: ["Deep relaxation", "Body awareness", "Better sleep"], sessions: 10, rating: 4.7 },
  { id: 4, name: "Stress Relief Therapy", description: "Comprehensive stress management program combining meditation, movement, and cognitive techniques.", duration: "45 min", type: "Therapy", level: "Intermediate", benefits: ["Stress management", "Emotional balance", "Resilience building"], sessions: 15, rating: 4.9 },
  { id: 5, name: "Nature Connection", description: "Outdoor mindfulness practices that connect you with nature for grounding and spiritual renewal.", duration: "60 min", type: "Outdoor", level: "All levels", benefits: ["Nature connection", "Grounding", "Spiritual renewal"], sessions: 6, rating: 4.8 },
  { id: 6, name: "Sleep Meditation", description: "Gentle guided meditations and relaxation techniques designed to improve sleep quality and duration.", duration: "25 min", type: "Sleep", level: "Beginner", benefits: ["Better sleep", "Deep rest", "Sleep hygiene","Improves focus"], sessions: 14, rating: 4.9 },
];

/* --------------------------- Uniform styles here -------------------------- */
const BTN_PRIMARY = "bg-primary text-white hover:bg-primary/90";
const BTN_OUTLINE = "border border-primary text-primary hover:bg-primary/10";
const BADGE_SOLID = "bg-primary text-white"; // use this everywhere for uniform badges
const TEXT_TITLE = "text-neutral-900";       // no gradients; readable on #fff5ec
const TEXT_BODY = "text-neutral-700";

/* ------------------------------- Page Merge ------------------------------- */
const ExercisePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[linear-gradient(0deg,_#BAD4D1_0%,_#CEE2E0_90%)]">
      {/* Hero (background image only section) */}
      <section
        className="py-20 px-6 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${exercisebackground})` }}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <h1 className={`text-5xl md:text-6xl font-extrabold leading-tight ${TEXT_TITLE}`}>
              Transform Your
              <span className="block bg-gradient-to-r from-primary via-wellness to-secondary bg-clip-text text-transparent pb-3">
                Body & Mind</span>
            </h1>

            <p className={`text-xl md:text-2xl ${TEXT_BODY} max-w-3xl mx-auto leading-relaxed`}>
              Discover the perfect balance of fitness and wellness with our comprehensive programs designed to nurture
              your body,<br/>mind, and spirit through guided experiences.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              
              {/* Scroll to Featured Programs */}
              <a href="#programs">
                <Button size="lg" className={`${BTN_PRIMARY} text-lg px-8 py-4`}>
                Explore Programs
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center space-y-2">
                <Activity className="h-12 w-12 text-primary mx-auto" />
                <h3 className={`text-xl font-semibold ${TEXT_TITLE}`}>Expert-Led Fitness</h3>
                <p className={`${TEXT_BODY}`}>Professional trainers guide every workout</p>
              </div>
              <div className="text-center space-y-2">
                <Heart className="h-12 w-12 text-primary mx-auto" />
                <h3 className={`text-xl font-semibold ${TEXT_TITLE}`}>Mindful Wellness</h3>
                <p className={`${TEXT_BODY}`}>Meditation and stress relief programs</p>
              </div>
              <div className="text-center space-y-2">
                <Users className="h-12 w-12 text-primary mx-auto" />
                <h3 className={`text-xl font-semibold ${TEXT_TITLE}`}>Community Support</h3>
                <p className={`${TEXT_BODY}`}>Connect with like-minded individuals</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Programs */}
      <section id="programs" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-6 ${TEXT_TITLE}`}>Featured Programs</h2>
            <p className={`text-xl ${TEXT_BODY} max-w-2xl mx-auto`}>
              Choose from our most popular fitness and wellness programs, carefully crafted to help you achieve your goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Exercise Card */}
            <Card
              className="group overflow-hidden rounded-3xl
                         border-2 border-purple-200 bg-white
                         transition-all duration-300
                         hover:border-purple-500
                         hover:shadow-lg hover:shadow-[0_8px_20px_rgba(139,92,246,0.25)]"
            >
              <div className="p-8">
                <CardHeader className="p-0 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="h-8 w-8 text-primary" />
                    <Badge className={BADGE_SOLID}>EXERCISE</Badge>
                  </div>
                  <CardTitle className={`text-3xl mb-4 ${TEXT_TITLE}`}>Fitness Programs</CardTitle>
                  <p className={`${TEXT_BODY} text-lg leading-relaxed`}>
                    From high-intensity workouts to gentle yoga flows, our exercise programs are designed to challenge
                    and inspire you at every fitness level.
                  </p>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-primary" />
                      <span className={TEXT_BODY}>6 specialized exercise programs</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className={TEXT_BODY}>Flexible scheduling options</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <span className={TEXT_BODY}>Group and individual sessions</span>
                    </div>
                  </div>

                  <a href="#exercise">
                    <Button className={`w-full ${BTN_PRIMARY} text-lg py-3`}>
                      Explore Exercise Programs
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                </CardContent>
              </div>
            </Card>

            {/* Wellness Card */}
            <Card
              className="group overflow-hidden rounded-3xl
                border-2 border-purple-200 bg-white
                transition-all duration-300
                hover:border-purple-500
                hover:shadow-lg hover:shadow-[0_8px_20px_rgba(139,92,246,0.25)]"
            >
              <div className="p-8">
                <CardHeader className="p-0 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Leaf className="h-8 w-8 text-primary" />
                    <Badge className={BADGE_SOLID}>WELLNESS</Badge>
                  </div>
                  <CardTitle className={`text-3xl mb-4 ${TEXT_TITLE}`}>Wellness & Meditation</CardTitle>
                  <p className={`${TEXT_BODY} text-lg leading-relaxed`}>
                    Nurture your mental and spiritual well-being with our comprehensive meditation and wellness programs
                    designed for inner peace.
                  </p>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-primary" />
                      <span className={TEXT_BODY}>6 guided wellness programs</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className={TEXT_BODY}>Daily meditation sessions</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-primary" />
                      <span className={TEXT_BODY}>Stress relief & mindfulness</span>
                    </div>
                  </div>

                  <a href="#wellness">
                    <Button className={`w-full ${BTN_PRIMARY} text-lg py-3`}>
                      Discover Wellness Programs
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Exercise Section (inline) */}
      <section id="exercise" className="scroll-mt-24 py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`text-5xl font-bold mb-6 ${TEXT_TITLE}`}>Exercise Programs</h2>
              <p className={`text-xl ${TEXT_BODY} mb-8 leading-relaxed`}>
                Discover our comprehensive range of fitness programs designed to help you achieve your health goals.
                From high-intensity workouts to gentle movements, we have something for everyone.
              </p>
              <div className="flex gap-4">
                <Button size="lg" className={BTN_PRIMARY}>Explore fitness programs</Button>
              </div>
            </div>
            <div className="relative">
              <img
                src={exerciseHero}
                alt="Exercise equipment and wellness studio"
                className="w-full object-cover"
              />
            </div>
          </div>

          {/* Cards */}
          <div className="text-center mb-12 mt-16">
            <h3 className={`text-3xl font-bold mb-4 ${TEXT_TITLE}`}>Our Exercise Programs</h3>
            <p className={`${TEXT_BODY} max-w-2xl mx-auto`}>
              Choose from our diverse selection of fitness programs, each designed by certified trainers to deliver
              maximum results while keeping you motivated and engaged.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercisePrograms.map((prog) => (
              <Card
                key={prog.id}
                className="group overflow-hidden rounded-2xl
                  border-2 border-purple-200 bg-white
                  transition-all duration-300
                  hover:border-purple-500
                  hover:shadow-lg hover:shadow-[0_8px_20px_rgba(139,92,246,0.25)]"
     
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className={`text-xl group-hover:text-primary transition-colors ${TEXT_TITLE}`}>
                      {prog.name}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-neutral-800">{prog.rating}</span>
                    </div>
                  </div>
                  {/* Uniform badge */}
                  <Badge className={BADGE_SOLID}>{prog.difficulty}</Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className={`${TEXT_BODY} text-sm leading-relaxed`}>{prog.description}</p>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-neutral-800">{prog.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-neutral-800">{prog.participants}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-neutral-800">{prog.equipment}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-neutral-900">Key Benefits:</h4>
                    <div className="flex flex-wrap gap-2">
                      {prog.benefits.map((benefit, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-primary/30 text-neutral-800">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className={`w-full mt-4 ${BTN_PRIMARY}`}>Join Program</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Wellness Section (inline) */}
      <section id="wellness" className="scroll-mt-24 py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`text-5xl font-bold mb-6 ${TEXT_TITLE}`}>Wellness &amp; Meditation</h2>
              <p className={`text-xl ${TEXT_BODY} mb-8 leading-relaxed`}>
                Nurture your mind, body, and spirit with our comprehensive wellness programs. Find inner peace, reduce
                stress, and cultivate lasting well-being through expert-guided practices.
              </p>
              <div className="flex gap-4">
                <Button size="lg" className={BTN_PRIMARY}>Begin Your Journey</Button>
                <Button variant="outline" size="lg" className={BTN_OUTLINE}>Explore Programs</Button>
              </div>
            </div>
            <div className="relative">
              <img
                src={meditationHero}
                alt="Peaceful meditation and wellness setting"
                className="w-full object-cover"
              />
            </div>
          </div>

          {/* Cards */}
          <div className="text-center mb-12 mt-16">
            <h3 className={`text-3xl font-bold mb-4 ${TEXT_TITLE}`}>Our Wellness Programs</h3>
            <p className={`${TEXT_BODY} max-w-2xl mx-auto`}>
              Discover transformative wellness practices designed to restore balance, reduce stress, and enhance your
              overall quality of life through mindful techniques.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wellnessPrograms.map((program) => (
              <Card
                key={program.id}
                className="group overflow-hidden rounded-2xl
                  border-2 border-purple-200 bg-white
                  transition-all duration-300
                  hover:border-purple-500
                  hover:shadow-lg hover:shadow-[0_8px_20px_rgba(139,92,246,0.25)]"
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className={`text-xl group-hover:text-primary transition-colors ${TEXT_TITLE}`}>
                      {program.name}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-neutral-800">{program.rating}</span>
                    </div>
                  </div>
                  {/* Uniform badge */}
                  <Badge className={BADGE_SOLID}>{program.type}</Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className={`${TEXT_BODY} text-sm leading-relaxed`}>{program.description}</p>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-neutral-800">{program.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-primary" />
                      <span className="text-neutral-800">{program.sessions} sessions</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <Brain className="h-4 w-4 text-primary" />
                      <span className="text-neutral-800">{program.level}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-neutral-900">Wellness Benefits:</h4>
                    <div className="flex flex-wrap gap-2">
                      {program.benefits.map((benefit, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-primary/30 text-neutral-800">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className={`w-full mt-4 ${BTN_PRIMARY}`}>Start Program</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        {/* Join Community */}
        <section
          id="community"
          className="py-20 px-6 bg-#fff5ec]"
        >
          <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-wellness to-[#6b4bb6] bg-clip-text text-transparent">
              Join Our Wellness Community
            </h2>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Connect with thousands of members who are transforming their lives through 
              <span className="font-bold text-wellness"> fitness </span> 
              and <span className="font-bold text-wellness"> wellness</span>.  
              Share your journey, find motivation, and grow together in a supportive environment.
            </p>

            <div className="grid sm:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold" style={{ color: "#26282A" }}>5,000+</div>
                <p className="text-muted-foreground">Active Members</p>
              </div>
              <div>
                <div className="text-4xl font-bold" style={{ color: "#26282A" }}>50+</div>
                <p className="text-muted-foreground">Expert Instructors</p>
              </div>
              <div>
              <div className="text-4xl font-bold" style={{ color: "#26282A" }}>12</div>
                <p className="text-muted-foreground">Program Categories</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
                Join Community
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-primary text-primary hover:bg-primary/10 text-lg px-8"
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>


      </section>
    </div>
  );
};

export default ExercisePage;


