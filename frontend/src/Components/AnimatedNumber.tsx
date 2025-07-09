import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  target: number;
  duration?: number;
  className?: string;
  onAnimationComplete?: () => void;
}

export default function AnimatedNumber({target, duration = 600, className = "", onAnimationComplete}: AnimatedNumberProps) {
    const [displayed, setDisplayed] = useState<number>(0);
    const startTimeRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
      startTimeRef.current = 0;

      const step = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);

        const value = 0 + (target - 0) * eased;
        setDisplayed(parseFloat(value.toFixed(1)));

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else{
          onAnimationComplete?.();
        }
      };

      rafRef.current = requestAnimationFrame(step);

      return () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
      };
    }, [target]);
    console.log(`ClassName color should be: ${className} `)
    return (
      <div className={`text-center`}>
        <span className={`text-2xl font-bold ${className}`}>{displayed.toFixed(1)}</span>
      </div>
    );
}
