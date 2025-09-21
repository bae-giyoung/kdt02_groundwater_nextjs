import Nav from "./Nav";
import Link from "next/link";
import Image from "next/image";

export default async function Header2 () {
    let headerStyle = "";
    if(document.getElementsByTagName("main")) headerStyle = "hstyle-12" ;

    return (
        <header className={headerStyle}>
            <div className="inner-header">
                <Link href={"/"}>
                    <h1 className="font-medium text-xl sm:text-2xl lg:text-3xl tracking-tighter">MulAlim Lab</h1>
                </Link>
                <Nav />
                <div className="block lg:hidden mobile-menu-btn"><span></span></div>
            </div>
        </header>
    );
}