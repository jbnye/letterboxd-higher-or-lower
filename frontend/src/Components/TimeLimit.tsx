import {useState, useEffect, useRef} from "react";

interface getFilmsResponse {
    id: number;
    slug: string;
    title: string;
    year: number;
    posterurl: string;
    inHouseURL: string;
}

interface TimeLimitProps{
    films: getFilmsResponse[],
    onTimeout: () => void,
    animationIsPlaying: boolean,
}
export default function TimeLimit({ films, onTimeout, animationIsPlaying }: TimeLimitProps) {
    const [time, setTime] = useState<number>(10.0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const onTimeoutRef = useRef(onTimeout);

    useEffect(() => {
        setTime(10.0);

        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if (animationIsPlaying) return;
            setTime(prev => {
                const next = parseFloat((prev - 0.1).toFixed(1));
                if (next <= 0) {
                    clearInterval(intervalRef.current!);
                    return 0.0;
                }
                return next;
            });
        }, 100);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [films, animationIsPlaying]);

    useEffect(() => {
        if (time <= 0) {
            onTimeout();
        }
    }, [time]);

    return (
        <div className="bg-black text-white">
            {time.toFixed(1)}
        </div>
    );
}