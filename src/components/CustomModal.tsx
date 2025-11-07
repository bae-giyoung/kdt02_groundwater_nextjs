'use client';
import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { modalStateAtom } from "@/atoms/atoms";
import { createPortal } from "react-dom";
import CustomButton from "./CustomButton";

export default function CustomModal() {
    const [modalState, setModalState] = useAtom(modalStateAtom);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleClose = () => {
        setModalState({ isOpen: false, header: null, content: null });
    };

    if (!isMounted || !modalState.isOpen ) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return createPortal( // 인자 2개
        <div className="donut-modal curr-modal" role="dialog" aria-modal="true">
            <div className="donut-modal-backdrop" onClick={handleClose}></div>
            <div className="donut-modal-content">
                <div className="donut-modal-header">
                    {modalState.header}
                    <CustomButton handler={handleClose} caption="닫기" bStyle="donut-modal-close" bType="button" />
                </div>
                <div className="donut-modal-body">
                    {modalState.content}
                </div>
            </div>
        </div>,
        modalRoot
    );
}