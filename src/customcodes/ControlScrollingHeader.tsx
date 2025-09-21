"use client";
import { useEffect } from "react";

type Options = {
    selector: string,
    hideOffset: number,
    showOffset: number,
    minDelta: number
}

export default function ControlScrollingHeader({
    selector= "#header",
    hideOffset= 8,
    showOffset= 8,
    minDelta= 8
}: Options) {

    useEffect(() => {
        const header = document.querySelector<HTMLElement>(selector);
        if(!header) return;

        let prevY = window.scrollY;

        const apply = (dir: "init" | "up" | "down") => {
            if(dir == "init") {
                header.classList.remove("hstyle-3");
                return;
            }

            if(dir === "down") {
                header.style.transform = "translateY(-100%)";
                document.documentElement.setAttribute("data-scroll-dir", "down");
                return;
            }

            if(dir === "up") {
                header.style.transform = "translateY(0)";
                header.classList.add("hstyle-3");
                document.documentElement.setAttribute("data-scroll-dir", "up");
                return;
            }
        }

        const onScroll = () => {
            const y = window.scrollY;
            const dy = y - prevY;

            if(Math.abs(dy) < minDelta) return;

            if(y < 8) {
                apply("init");
            } else if(dy > 0 && y > hideOffset) {
                apply("down");
            } else if(dy < 0 && (prevY - y) > showOffset) {
                apply("up");
            }

            prevY = y;
        }

        window.addEventListener("scroll", onScroll, {passive: true});

        apply("init");

        return () => {
            window.removeEventListener("scroll", onScroll);
        }

    }, []);

    return null;
}