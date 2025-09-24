'use client';
import { useRef } from "react";

export default function CustomAccordian (
  {head, content}
  : {head: string, content: string}
) {
    const accordianRef = useRef<HTMLDivElement>(null);

    const handleAccordian = () => {
      document.querySelectorAll(".accordian")
      .forEach((el) => {
        if(!(el == accordianRef.current)) 
          el.classList.remove("is-open");
      });
      if(!accordianRef.current) return;
      accordianRef.current.classList.toggle("is-open");
    }

    return (
      <div ref={accordianRef} className="accordian w-full border-style-1 h-auto font-medium border-radius-15 shadow-1 bg-white overflow-hidden">
        <div onClick={handleAccordian} tabIndex={0} className="accordian-head flex items-center min-h-14 px-5">{head}<i className="accordian-arrow"></i></div>
        <div className="accordian-content">
          <p className="p-5">{content}</p>
        </div>
      </div>
    );
}