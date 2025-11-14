'use client';
import { MouseEvent } from "react";

export default function CustomButton(
    {caption, bType, bStyle, handler, disabled} 
    : {caption: string | React.ReactElement, bType: "submit" | "button" | "reset" | undefined, bStyle: string, handler?: (e : MouseEvent<HTMLButtonElement>)=> void, disabled?: boolean}
) {
    return (
        <button type={bType} onClick={handler} className={bStyle} disabled={disabled}><span>{caption}</span></button>
    );
}