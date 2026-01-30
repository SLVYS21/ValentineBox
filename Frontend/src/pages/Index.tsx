import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Collections from "@/components/Collections";

const Index = () => {
  return (
    <div className="min-h-screen landing-theme">
      <Header />
      <main>
        <Hero />
        <Collections />
      </main>
    </div>
  );
};

export default Index;
