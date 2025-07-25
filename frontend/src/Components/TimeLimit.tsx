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
}

export default function TimeLimit({films, onTimeout}: TimeLimitProps){
    const [time, setTime] = useState<number>(10.0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setTime(10.0); 

        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setTime(prev => {
                const next = parseFloat((prev - 0.1).toFixed(1));
                if (next <= 0) {
                    clearInterval(intervalRef.current!);
                    onTimeout(); 
                    return 0.0;
                }
                return next;
            });
        }, 100);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [films]);

    


    return (
        <div className="bg-black text-white">
            {time.toFixed(1)}
        </div>
    )
}