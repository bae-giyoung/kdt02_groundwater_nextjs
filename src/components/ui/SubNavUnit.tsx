'use client';
import Link from "next/link";

export default function SubNavUnit ({navName, navPath} : {navName: string, navPath: string}) {
  return (
    <>
        <div className={navPath == "/" ? "subnav-home" : "subnav-head"}><Link href={navPath}>{navName}</Link></div>
        <div className="subnav-arrow"></div>
    </>
  );
}