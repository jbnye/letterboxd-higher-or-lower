import {useState, useEffect} from "react" ;


interface AnimatedNumberProps {
  target: number;
  duration?: number; // optional, total time in ms
  className?: string; // for styling
}


export default function AniamtedNumber({target, duration = 600, className}: AnimatedNumberProps){

    const [displayedNum, setDisplayedNum] = useState<number>(target);
    const [prev, setPrev] = useState(target);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if(target === displayedNum) return;

        setPrev(displayedNum);
        setIsAnimating(true);

        const timeout = setTimeout(() =>{
            setDisplayedNum(target);
        }, duration);
        return () => clearTimeout(timeout);
    }, [target]);



    useEffect(() => {
            if(isAnimating){
                const timer = setTimeout(() => setIsAnimating(false), duration);
                return () => clearTimeout(timer);
            }
    },[isAnimating]);

  return (
    <div className={`relative h-[2rem] overflow-hidden text-center ${className}`}>
      <span
        className={`absolute left-0 right-0 transition-transform duration-[${duration}] ease-out block text-xl ${
          isAnimating ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
        }`}
        key={`prev-${prev}`}
      >
        {prev.toFixed(1)}
      </span>
      <span
        className={`absolute left-0 right-0 transition-transform duration-[${duration}] ease-out block text-xl ${
          isAnimating ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
        key={`curr-${target}`}
      >
        {target.toFixed(1)}
      </span>
    </div>
  );
}