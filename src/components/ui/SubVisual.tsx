'use client';
export default function SubVisual (
  {children, tit1, tit2, tit3}
  : {children?: React.ReactNode, tit1: string, tit2: string, tit3: string}
) {
  const flexMode = children 
                  ? "block md:flex gap-7 justify-between" 
                  : "";
  return (
    <div id="subvis">
      <div id="inner-subvis" className={flexMode}>
        <div className="w-full">
          <h2 className="c-tit01">{tit1}</h2>
          <p className="mb-3 md:mb-6 text-[#444444] text-lg md:text-2xl">{tit2}</p>
          <p className="text-[#929292] text-sm md:text-lg">{tit3}</p>
        </div>
        {children}
      </div>
    </div>
  );
}