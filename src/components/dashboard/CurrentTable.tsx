"use client";
import { memo, useMemo } from "react";
import type { DashboardTableRow, DashboardTableDiffRow } from "@/types/uiTypes";

type Column = {
    key: any; // keyof T
    label: string;
}

type TableProps = {
    data: DashboardTableRow[];
    dataDiff: DashboardTableDiffRow[];
    columns: Column[];
    emphasis?: string;
}

function CurrentTable({data, dataDiff, columns, emphasis}: TableProps) {
    const headers = useMemo(() => columns.map((col) => col.label), [columns]);

    return (
        <div className="table-style01 table-container overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead>
                    <tr>
                        {headers.map((label, idx) => (
                            <th scope="col" key={label + idx} className={((emphasis && emphasis[0] && columns[idx].key == emphasis) ? " emphasis bg-sky-200 font-bold" : "")}>
                                {label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                            {columns.map((col, colIdx) => (
                                <td key={colIdx} className={((emphasis && emphasis[1] && col.key == emphasis) ? " emphasis bg-sky-100 font-bold" : "")}>
                                    <span>{row[col.key]}</span>
                                    {/* {rowIdx !== 0 && col.key != 'ymd' && getDailyDiffRatio(data, rowIdx, (col.key).toString())} */}
                                    <span key={(rowIdx + colIdx)} className={
                                        (
                                            Number.isFinite(dataDiff[rowIdx]?.[col.key]) && Number(dataDiff[rowIdx][col.key]) > 0 
                                            ? "text-blue-500" 
                                            : Number.isFinite(dataDiff[rowIdx]?.[col.key]) && Number(dataDiff[rowIdx][col.key]) < 0 
                                            ? "text-red-500" 
                                            : ""
                                        ) + " ml-1"
                                    } style={{fontSize: '10px'}}
                                    >
                                        {col.key != 'ymd' ? dataDiff[rowIdx][col.key] : ''}
                                    </span>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default memo(CurrentTable);