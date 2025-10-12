'use client';
import { MouseEvent } from "react";

export default function CustomButton(
    {caption, bType, bStyle, handler} 
    : {caption: string, bType: "submit" | "button" | "reset" | undefined, bStyle: string, handler?: (e : MouseEvent<HTMLButtonElement>)=> void}
) {
    return (
        <button type={bType} onClick={handler} className={bStyle}><span>{caption}</span></button>
    );
}