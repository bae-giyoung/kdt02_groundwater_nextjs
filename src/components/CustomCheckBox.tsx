'use client';
import { RefObject } from "react";

/* 미완성 : 필요없으면 나중에 지우기 */
interface CustomCheckBoxProps {
    caption: string, 
    ipRef?: RefObject<HTMLInputElement | null>, 
    ipName: string, 
    ipValue?: string,
    isEssential?: boolean,
}

export default function CustomCheckBox({caption, ipRef, ipName, ipValue, isEssential} : CustomCheckBoxProps) {
    const handleChange = () => {
        console.log(ipRef?.current?.checked);
    }
    return (
        <div className="checkbox-group">
            <input ref={ipRef && ipRef} id={ipName} name={ipName} value={ipValue && ipValue} type="checkbox" onChange={handleChange} required={isEssential} />
            <label htmlFor={ipName}>{caption}</label>
        </div>
    );
}