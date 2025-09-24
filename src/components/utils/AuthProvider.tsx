'use client';

import { useAtom } from "jotai";
import { isLoginAtom } from "@/atoms/atoms";
import { useEffect } from "react";

export default function AuthProvider() {
    const [isLogin, setIsLogin] = useAtom(isLoginAtom);

    useEffect(() => {
        if(!sessionStorage.getItem("user"))
            setIsLogin(false);
        else
            setIsLogin(true);
    }, [isLogin]);

    return null;
}