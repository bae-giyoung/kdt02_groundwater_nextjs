'use client'

import { useEffect, useRef } from "react";

export default function () {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cref = useRef<HTMLDivElement>(null);
    const ctxRef = useRef<any>(null);


    const settings = { // 일단 wave 코드 만든 후에 컴포넌트로 변경/ 이건 props로 받는 걸로 하자
        count: 1
    }

    const initCanvasConfigs = () => {
        if(!canvasRef.current) return;
        ctxRef.current = canvasRef.current.getContext("2d");
        canvasRef.current.width = canvasRef.current.getBoundingClientRect().width;
        canvasRef.current.height = canvasRef.current.getBoundingClientRect().height;
    }

    const drawWaves = () => {
        if(!canvasRef.current) return
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;
        ctxRef.current.clearRect(0, 0, width, height);
        //console.log(width, height)

        // 나중에 애니메이션 클래스로 만들거니까 계산식으로 해두기
        const peeks = 2;
        const cols = 2 * peeks;
        const colSize = Math.round(width / cols); // 변수명 바꾸자
        const points = [0]; // 나중에 클래스로 만들 때, 봉우리 개수 조절 가능하게 생각해두기, 포인트의 갯수는 2x+1
        for(let i = 1; i < cols; i++) {
            points.push(colSize * i);
        }
        points.push(width);
        //console.log(points)
    }

    useEffect(()=>{
        initCanvasConfigs();

        drawWaves();
    }, [])

    return (
        <div className="wave-canvas-container flex justify-center items-center w-full h-full">
            <div className="wave-canvas-container flex justify-center items-center w-full h-[300px]">
                <div ref={cref} className="wave-canvas-container w-full h-full">
                    <canvas ref={canvasRef} className="w-full h-full"></canvas>
                </div>
            </div>
        </div>
    );
}