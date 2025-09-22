'use client';

import { useEffect, useRef } from "react";
import Wave from "@/customcodes/Wave";

export default function WaveLogo({h} : {h: number}) {

    const canvas = useRef<HTMLCanvasElement>(null);

    useEffect(()=>{
        if(!canvas.current || !canvas.current.parentElement) return;
        canvas.current.width = canvas.current.parentElement.clientWidth;
        canvas.current.height = h;
        const wave = new Wave(canvas.current, 10, h*0.3, 0, 2);
        wave.draw();
        const id = requestAnimationFrame(wave.animate.bind(wave));
    }, [])

    return (
        <div className="wave-logo" style={{width:"100%", height:h}}>
            <canvas ref={canvas} className="w-full h-full"></canvas>
        </div>
    );
}