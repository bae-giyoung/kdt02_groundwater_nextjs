'use client'

import { useEffect, useRef } from "react";

export default function WaveTempPage () {
    const cwrapperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D>(null);


    const settings = { // 일단 wave 코드 만든 후에 컴포넌트로 변경/ 이건 props로 받는 걸로 하자
        count: 1
    }

    const initCanvasConfigs = () => {
        if(!canvasRef.current || !cwrapperRef.current) return;
        ctxRef.current = canvasRef.current.getContext("2d");
        canvasRef.current.width = cwrapperRef.current.getBoundingClientRect().width;
        canvasRef.current.height = cwrapperRef.current.getBoundingClientRect().height;
    }

    const drawWaves = () => {
        if(!canvasRef.current || !ctxRef.current) return;
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;
        const centerY = height / 2;
        ctxRef.current.clearRect(0, 0, width, height);
        //console.log(width, height);

        // 나중에 애니메이션 클래스로 만들거니까 계산식으로 해두기  
        const peeks = 4;
        const cols = 2 * peeks;
        const colSize = Math.round(width / cols); // 변수명 바꾸자
        const points = [0]; // 나중에 클래스로 만들 때, 봉우리 개수 조절 가능하게 생각해두기, 포인트의 갯수는 2x+1
        for(let i = 1; i < cols; i++) {
            points.push(colSize * i);
        }
        points.push(width);
        //console.log(points);

        ctxRef.current.beginPath();
        //ctxRef.current.moveTo(points[0], centerY);
        for(let i = 0; i < points.length - 1; i+=2) {
            const yPos1 = i % 4 == 1 ? 0
                        : i % 4 == 3 ? height
                        : centerY;
            const yPos2 = (i+1) % 4 == 1 ? 0
                        : (i+1) % 4 == 3 ? height
                        : centerY;
            
            if(i+1 < points.length)
                ctxRef.current.arcTo(points[i], yPos1, points[i+1], yPos2, height);
            else
                ctxRef.current.lineTo(points[i], yPos1);
            //ctxRef.current.lineTo(points[i], yPos1);
            //if(i+1 < points.length) ctxRef.current.lineTo(points[i+1], yPos2);
            console.log(points[i], yPos1, points[i+1], yPos2);
        }

        ctxRef.current.stroke();
    }

    useEffect(()=>{
        initCanvasConfigs();
        drawWaves();
    }, [])

    return (
        <div className="flex justify-center items-center w-full h-full">
            <div className="wave-canvas-container flex justify-center items-center w-full h-[300px]">
                <div ref={cwrapperRef} className="wave-canvas-container w-full h-full">
                    <canvas ref={canvasRef} className="w-full h-full"></canvas>
                </div>
            </div>
        </div>
    );
}