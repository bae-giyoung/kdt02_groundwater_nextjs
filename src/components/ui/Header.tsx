import Nav from "./Nav";
import Link from "next/link";
import ControlScrollingHeader from "@/customcodes/ControlScrollingHeader";
import UserButton from "./UserButton";
import MenuButton from "./MenuButton";
import SetHeaderStyle from "@/customcodes/SetHeaderStyle";

export default async function Header () {
    return (
        <>
            <header id="header">
                <div className="inner-header">
                    <Link href={"/"} id="logo">
                        <h1 className="font-medium text-xl sm:text-2xl lg:text-3xl tracking-tighter">MulAlim Lab</h1>
                    </Link>
                    <Nav />
                    <UserButton targetPath="/login" />
                    <SetHeaderStyle />
                    <MenuButton />
                </div>
            </header>
            <ControlScrollingHeader selector="#header" hideOffset={90} showOffset={8} minDelta={8} />
        </>
    );
}