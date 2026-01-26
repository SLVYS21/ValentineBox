import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

interface HeartParticle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

const FallingHearts = () => {
  const [hearts, setHearts] = useState<HeartParticle[]>([]);

  useEffect(() => {
    const generateHearts = () => {
      const newHearts: HeartParticle[] = [];
      for (let i = 0; i < 20; i++) {
        newHearts.push({
          id: i,
          left: Math.random() * 100,
          size: Math.random() * 16 + 12,
          duration: Math.random() * 8 + 8,
          delay: Math.random() * 10,
          opacity: Math.random() * 0.4 + 0.2,
        });
      }
      setHearts(newHearts);
    };

    generateHearts();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute heart-fall"
          style={{
            left: `${heart.left}%`,
            animationDuration: `${heart.duration}s`,
            animationDelay: `${heart.delay}s`,
          }}
        >
          <div
            className="heart-sway"
            style={{
              animationDuration: `${heart.duration / 3}s`,
            }}
          >
            <Heart
              size={heart.size}
              className="text-primary fill-primary"
              style={{
                opacity: heart.opacity,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default FallingHearts;
