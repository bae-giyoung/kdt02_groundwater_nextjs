"use client"
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAtom, useSetAtom } from "jotai";
import { pathnameAtom } from "@/atoms/atoms";

export default function SetHeaderStyle() {
    const setPathnameAtom = useSetAtom(pathnameAtom);
    let pathname = usePathname();
    
    useEffect(() => {
        if(pathname === "/")
            document.body.classList.add("has-hstyle-1");
        else
            document.body.classList.remove("has-hstyle-1");

        setPathnameAtom(pathname);
    }, [pathname]);

    return null;
}