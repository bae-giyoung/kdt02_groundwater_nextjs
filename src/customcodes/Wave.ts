/* =========== TODO =========== */
/* 
* 중심점(y), 곡의 강도, 시작점(y)... 조절할 수 있게 할지 => 객체 인자로 묶자
*/
import Point from "./Point";
export default class Wave {

    constructor(
        public canvas: HTMLCanvasElement, public cols: number, // cols 변수명 맘에 안드는데 half파장으로 변경하면.... 파장을 하면 코드 다시 짜고..
        public amp: number, public positionY: number = 0, public lineWidth: number = 1,
        private ctx: CanvasRenderingContext2D | null = canvas?.getContext("2d"), 
        private colWidth: number = 0, private points: Point[] = []
    ) {
        if(!this.canvas) return;
        this.ctx = this.canvas.getContext("2d");

        const width = canvas.getBoundingClientRect().width;
        this.colWidth = Math.ceil(width / cols); // 기억: 반응형에서 갱신해야할 속성임

        for(let i = 0; i <= cols; i++) { // 점은 cols + 1
            const xPos = i != cols ? this.colWidth * i : width;
            const yPos = i % 4 == 1 ? 0 : i % 4 == 3 ? 2*amp : amp;
            this.points.push(new Point(xPos, yPos));
            console.log(xPos, yPos, this.colWidth);
        }
    }

    draw() {
        if(!this.canvas || !this.ctx) return;
        const ctx = this.ctx;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if(!ctx) return;
        ctx.translate(0, this.lineWidth);
        ctx.beginPath();

        const points = this.points;
        if(!points) return;

        ctx.moveTo(points[0].x, points[0].y);
        for(let i = 1; i < points.length; i++) { // 일단 다 만들고 식 정리!!!!! 캐싱할거 , 그리고 곡의 강도도 조절할 수 있게?       
            if(i % 2 == 0)
                ctx.bezierCurveTo(points[i-1].x + (this.colWidth/2), points[i-1].y, points[i].x, points[i].y, points[i].x, points[i].y);
            else
                ctx.bezierCurveTo(points[i-1].x, points[i-1].y, points[i].x - (this.colWidth/2), points[i].y, points[i].x, points[i].y);
        }

        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // 움직이기
    animate() {
        const points = this.points;
        for(let i = 1; i < points.length; i+=2) {
            points[i].y = (points[i].y + 1) % (this.amp * 2);
            console.log(points[i].y);
        }
        const id = requestAnimationFrame(this.draw.bind(this));
    }

    // 반응형: 캔버스의 크기가 변할때만 trigger하자
    resize() {

    }

}