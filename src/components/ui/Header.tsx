'use client';
import Nav from "./Nav";
import Link from "next/link";
import { headerType } from "@/types/uiTypes";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import ControlScrollingHeader from "@/customcodes/ControlScrollingHeader";

// 서버 컴포넌트로 바꾸자
export default function Header () {
    const pathname: string = usePathname();
    const headerRef = useRef<HTMLElement>(null);

    const getHeaderStyle = (pathname: string) => {
        const headerStyle: headerType = new headerType();
        if(pathname == "/") {
            headerStyle.className = "hstyle-1";
            return headerStyle;
        }

        headerStyle.className = "hstyle-2";
        return headerStyle;
    }
    
    const headerStyle: headerType = getHeaderStyle(pathname);

    const handleMoMenu = () => {
        if(!headerRef.current) return;
        headerRef.current.classList.toggle("is-closed");
    }


    return (
        <>
            <header ref={headerRef} id="header" className={headerStyle.className}>
                <div className="inner-header">
                    <Link href={"/"}>
                        <h1 className="font-medium text-xl sm:text-2xl lg:text-3xl tracking-tighter">MulAlim Lab</h1>
                    </Link>
                    <Nav />
                    <Link href={"/login"} 
                        className="user-btn group hidden lg:flex items-center gap-1.5 px-2.5 py-1 lg:gap-2.5 lg:px-3.5 lg:py-2 border-b-[3px] rounded-2xl">
                        <span className="shrink-0 text-lg sm:text-xl lg:text-2xl font-bold">Login</span>
                        <i className="arr w-4 h-4 lg:w-[22px] lg:h-[22px] shrink-0 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-all duration-300"></i>
                    </Link>
                    <div className="block lg:hidden mobile-menu-btn" onClick={handleMoMenu}><span></span></div>
                </div>
            </header>
            <ControlScrollingHeader selector="#header" hideOffset={90} showOffset={8} minDelta={8} />
        </>
    );
}