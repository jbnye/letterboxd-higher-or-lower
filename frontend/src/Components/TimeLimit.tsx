import { useState, useEffect, useRef } from "react";

interface getFilmsResponse {
    id: number;
    slug: string;
    title: string;
    year: number;
    posterurl: string;
    inHouseURL: string;
}

interface TimeLimitProps {
    films: getFilmsResponse[],
    onTimeout: () => void,
    animationIsPlaying: boolean,
    setShouldPulse: (shouldPulse: boolean)=> void,
}
    const TOTAL_TIME = 10.5;
export default function TimeLimit({ films, onTimeout, animationIsPlaying, setShouldPulse}: TimeLimitProps) {
    const [time, setTime] = useState<number>(TOTAL_TIME)
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const radius = 50;
    const stroke = 8
    const normalizedRadius = radius - stroke / 2;
    const circumferance = normalizedRadius * 2 * Math.PI;
    const strokeColor = time >= 7.0 ? "#40bcf4": (time >= 4 && time < 7) ? "#ff8000" : "#f70000";

    useEffect(() => {
        if (animationIsPlaying) return;
        //setTime(10.5);

        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            //if (animationIsPlaying) return;
            setTime(prev => {
                if (prev <= 0.032) {
                clearInterval(intervalRef.current!);
                onTimeout?.();
                return 0;
                }
                if(prev <= 4.00){
                    setShouldPulse(true);
                }
                return parseFloat((prev - 0.032).toFixed(3));
            });
        }, 32);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [films, animationIsPlaying]);

    return (
        <div className={`p-1 m-0 `}>
            <svg height={radius * 2} width={radius *2}>
                {/* Background circle */}
                <circle
                    
                    fill="transparent"
                    strokeWidth="stroke"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />

                {/* Animated progress circle */}
                <circle
                    stroke={strokeColor}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumferance}
                    strokeDashoffset = {(1 - time / TOTAL_TIME) * circumferance}
                    strokeLinecap="butt"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    style={{
                    transition: "stroke-dashoffset 0.1s linear",
                    transform: "rotate(-90deg)",
                    transformOrigin: "center",
                    }}
                />
                {/* Countdown number in center */}
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="20"
                    fill="#111827"
                >
                    
                    {(animationIsPlaying && time <= 0.0) ? "TIME OUT" : Math.floor(time) }
                </text>
            </svg>
        </div>
    );
}