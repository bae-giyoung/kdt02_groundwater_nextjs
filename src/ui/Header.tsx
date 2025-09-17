// 인터렉션이 있는 클라이언트 컴포넌트
'use client';
import { headerType } from "@/types/uiTypes";

export default function Header () {
    const style1 : headerType = { // 컴포넌트 밖으로 빼야 하나? 공용폴더로 가야 하나...?
        textColor: "white",
        bgColor: "transparent"
    }

    return (
        <header className="">
        헤더 위치
        </header>
    );
}