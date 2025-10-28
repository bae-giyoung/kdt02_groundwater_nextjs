'use client';

import { useSetAtom, useAtomValue } from "jotai";
import { refreshSessionAtom, sessionAtom } from "@/atoms/atoms";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function AuthProvider() {
    const pathname = usePathname();
    const lastPath = useRef<string | null>(null);
    const session = useAtomValue(sessionAtom);
    const refreshSession = useSetAtom(refreshSessionAtom);

    useEffect(() => {
        if(session.status === "unknown") {
            refreshSession();
            return;
        }

        if(session.status !== "checking" && lastPath.current !== pathname) {
            lastPath.current = pathname;
            refreshSession();
        }

    }, [pathname, session.status, refreshSession]);

    return null;
}