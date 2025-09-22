'use client';
import { pathnameAtom } from "@/atoms/atoms";
import { useAtomValue } from "jotai";
import { useEffect } from "react";


export default function () {
    const pathname = useAtomValue(pathnameAtom);

    const handleMoMenu = () => {
        document.body.classList.toggle("is-mobile-menu-open");
    }

    useEffect(() => {
        document.body.classList.remove("is-mobile-menu-open");
    }, [pathname])
  
    return (
        <div className="mobile-menu-btn block lg:hidden" onClick={handleMoMenu}><span></span></div>
    );
}