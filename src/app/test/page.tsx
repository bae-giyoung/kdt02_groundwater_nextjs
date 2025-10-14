'use client';

import { useEffect, useRef } from "react";
import Wave from "@/customcodes/Wave";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function () {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const drawWave = (canvas: HTMLCanvasElement) => {
        const canvasHeight = canvas.getBoundingClientRect().height;
        const wave = new Wave(canvas, 10, canvasHeight*0.1, canvasHeight*0.5 );
        wave.draw();
    };

    useEffect(()=>{
        // 테스트 코드: CSV To JSON파일
        const runCSTToJSON = async () => {
            const resp = await fetch(`${BASE_URL}/api/v1/dashboard/featureImportance`, 
                {
                    headers: { "Content-type" : "application/json" },
                    method: "POST",
                }
            );
            if(resp.ok) {
                console.log(resp.json());
            } else {
                console.log(resp.body);
            }
        };
        //runCSTToJSON();
        if(canvasRef.current) drawWave(canvasRef.current);
    },[]);

    return (
        <div id="contents" className="flex justify-center items-center h-svh">
            <canvas ref={canvasRef} width="500" height="300"></canvas>
        </div>
    );
}