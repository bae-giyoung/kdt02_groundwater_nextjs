'use client';
import { usePathname } from "next/navigation";
import SubNavUnit from "./SubNavUnit";
import pageNamesInfo from "@/data/page_names_info.json";

type pageNamesKey = keyof typeof pageNamesInfo;

export default function SubNav () {
    const pathnames: string[] = usePathname().split("/");
    if(pathnames[0] == "") pathnames[0] = "/";

    const pathList = pathnames.map((el: string) => ({path: el, name: pageNamesInfo[(el as pageNamesKey)]}));

    return (
        <div className="subnav-group">
            {pathList.map((el, idx) => <SubNavUnit key={el.path + el.name + idx} navName={el.name} navPath={el.path} />)}
        </div>
    );
}