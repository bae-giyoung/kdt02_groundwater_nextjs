// 서버의 인가 설정에 따를 것이므로 임시 코드임. 추후 백엔드와 합치고 지울것
'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WhetherAuthorized () {
    const router = useRouter();

    useEffect(() => {
        if(!sessionStorage.getItem("user")) {
            alert("로그인 후 이용이 가능합니다.");
            router.push("/login");
        }
    }, []);

    return null;
}