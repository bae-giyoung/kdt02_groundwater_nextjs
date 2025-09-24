"use client"
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SetHeaderStyle() {
    let pathname = usePathname();
    
    useEffect(() => {
        if(pathname === "/")
            document.body.classList.add("has-hstyle-1");
        else
            document.body.classList.remove("has-hstyle-1");
    }, [pathname]);

    return null;
}