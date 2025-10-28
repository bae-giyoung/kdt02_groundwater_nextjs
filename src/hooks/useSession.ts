'use client';
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { refreshSessionAtom, sessionAtom } from "@/atoms/atoms";

export default function useSession(autoRefresh = true) {
    const session = useAtomValue(sessionAtom);
    const refreshSession = useSetAtom(refreshSessionAtom);

    useEffect(() => {
        if(autoRefresh) refreshSession();
    }, [autoRefresh, refreshSession]);

    return {
        session,
        refreshSession,
        isUnknown: session.status === 'unknown',
        isLoading: session.status === 'checking',
        isAuthenticated: session.status === 'authenticated',
    }
}