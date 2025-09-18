// 일단 물결 애니메이션 코드 러프하게 개발하고 나서 클래스로 만들어보자
import Point from "./Point";
export default class Wave {

    constructor(public canvas: HTMLCanvasElement, public cols: number, public points: Point[] = []) {
        const width = canvas.getBoundingClientRect().width;
        const height = canvas.getBoundingClientRect().height;
        const colWidth = Math.ceil(width / cols);

        //this.points = [];
        for(let i = 0; i < cols; i++) {
            const xPos = i != cols - 1 ? colWidth * i : width;
            const yPos = i % 4 == 1 ? 0 : i % 4 == 3 ? height : height / 2;
            this.points.push(new Point(xPos, yPos));
        }
    }

    // 캔버스에 wave 그리기
    draw(points: Point[]) {
        if(!this.canvas) return;
        const ctx = this.canvas.getContext("2d");
        
        if(!ctx) return;
        ctx.beginPath();

        ctx.moveTo(0,0);
        for(let i = 0; i < points.length; i++) {
            if (i == 0)
                ctx.moveTo(points[i].x, points[i].y);
            else
                ctx.lineTo(points[i].x, points[i].y);
        }

        // 곡선으로 변환


        return ctx;
    }

    // 움직이기
    animate() {

    }

}