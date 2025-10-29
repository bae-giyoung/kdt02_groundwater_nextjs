"use client"
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const desktopBreakpoint = 1000;

export default function SetHeaderStyle() {
    let pathname = usePathname();

    const handleResize = () => {
        if(window.innerWidth >= desktopBreakpoint) {
            document.body.classList.remove("is-mobile-menu-open");
        }
    };

    useEffect(() => {
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => {
          window.removeEventListener("resize", handleResize);
        };
    }, []);
    
    useEffect(() => {
        if(pathname === "/")
            document.body.classList.add("has-hstyle-1");
        else
            document.body.classList.remove("has-hstyle-1");

        document.body.classList.remove("is-mobile-menu-open");
    }, [pathname]);

    return null;
}