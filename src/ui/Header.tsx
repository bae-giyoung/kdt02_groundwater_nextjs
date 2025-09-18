'use client';
import Nav from "./Nav";
import Link from "next/link";
import Image from "next/image";
import { headerType } from "@/types/uiTypes";
import logoBk from "../../public/assets/arrow_link_bk.png";
import logoWh from "../../public/assets/arrow_link_wh.png";
import { usePathname } from "next/navigation";

export default function Header () {
    const pathname: string = usePathname();

    const getHeaderStyle = (pathname: string) => { // 밖으로 뺄까?
        const config: headerType = new headerType();
        if(pathname == "/") {
            config.className = "hstyle-1";
            config.logoSrc = logoWh;
            config.borderStyle = "border-white";
            return config;
        }

        config.className = "hstyle-2";
        config.logoSrc = logoBk;
        config.borderStyle = "border-black";
        return config;
    }
    
    const headerStyle: headerType = getHeaderStyle(pathname);

    return (
        <header className={headerStyle.className}>
            <div className="inner-header">
                <Link href={"/"}>
                    <p className="font-medium text-3xl tracking-tighter">MulAlim Lab</p>
                </Link>
                <Nav />
                <Link href={"/login"} 
                    className={"flex items-center gap-2.5 px-4 py-2 border-b-[3px] rounded-2xl " + headerStyle.borderStyle}>
                    <span className="shrink-0 text-2xl font-bold">Login</span>
                    <i className="shrink-0"><Image src={headerStyle.logoSrc} alt="화살표" /></i>
                </Link>
            </div>
        </header>
    );
}