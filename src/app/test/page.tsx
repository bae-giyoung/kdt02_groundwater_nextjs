'use client';

import { useEffect, useRef } from "react";
import Wave from "@/customcodes/Wave";

export default function () {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const drawWave = (canvas: HTMLCanvasElement) => {
        const canvasHeight = canvas.getBoundingClientRect().height;
        const wave = new Wave(canvas, 10, canvasHeight*0.1, canvasHeight*0.5 );
        wave.draw();
    };

    useEffect(()=>{
        if(canvasRef.current) drawWave(canvasRef.current);
    },[]);

    return (
        <div id="contents" className="flex justify-center items-center h-svh">
            <canvas ref={canvasRef} width="500" height="300"></canvas>
        </div>
    );
}