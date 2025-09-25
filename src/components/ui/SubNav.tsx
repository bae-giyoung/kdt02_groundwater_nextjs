'use client';
import { usePathname } from "next/navigation";
import SubNavUnit from "./SubNavUnit";

type pathListType = {
    path: string,
    name: string
}

export default function SubNav () {
    const pathnames: string[] = usePathname().split("/");
    if(pathnames.length > 1 && pathnames[0] == "") pathnames.shift();

    const pathList: pathListType[] = [{path: "/", name: ""}];

    // 서브페이지 이름 정보를 어디에 저장을 할까. 정적 파일을 만들까.
    pathnames.map((el) => pathList.push({path: el, name: "서브페이지 이름"}));
    
    console.log(pathList.length);

    return (
        <div className="subnav-group">
            {pathList.map((el, idx) => <SubNavUnit key={el.path + el.name + idx} navName={el.name} navPath={el.path} />)}
        </div>
    );
}