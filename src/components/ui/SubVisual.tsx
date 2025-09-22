export default async function SubVisual (
  {position="relative", tit1, tit2, tit3}
  : {position: string, tit1: string, tit2: string, tit3: string}) {
  return (
    <div id="subvis" className={position}>
      <div id="inner-subvis">
        <h2 className="c-tit01">{tit1}</h2>
        <p className="mb-3 md:mb-6 text-[#444444] text-lg md:text-2xl">{tit2}</p>
        <p className="text-[#929292] text-sm md:text-lg">{tit3}</p>
      </div>
    </div>
  );
}