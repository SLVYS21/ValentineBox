import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-couple.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 md:pt-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Couple romantique partageant un cadeau"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-xl md:max-w-2xl">
          <h1 className="font-script text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-primary-foreground mb-4 animate-fade-in-up leading-tight">
            Offrez de
            <br />
            <span className="text-primary">l'Émotion</span>
          </h1>
          
          <p className="text-primary-foreground/90 text-base sm:text-lg md:text-xl mb-8 max-w-md animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Des coffrets cadeaux uniques pour une Saint-Valentin inoubliable. 
            Choisissez une composition prête à offrir ou créez la vôtre sur mesure.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Button
              variant="outline"
              size="lg"
              className="bg-card/90 hover:bg-card text-primary rounded-full font-semibold px-8 py-6 text-base"
              asChild
            >
              <a href="#collections">Découvrir les Packs</a>
            </Button>
            <Button
              size="lg"
              className="bg-transparent hover:opacity-90 text-white rounded-full border border-white hover:bg-white/10 font-semibold px-8 py-6 text-base shadow-lg"
              asChild
            >
              <a href="#composer">Créer ma Box</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative hearts */}
      <div className="absolute bottom-10 right-10 hidden lg:block animate-float">
        <div className="w-20 h-20 text-primary/30">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default Hero;
