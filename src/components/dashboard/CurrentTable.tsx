"use client";
import { memo, useMemo } from "react";
import type { DashboardTableData, DashboardTableRow, DashboardTableDiffRow } from "@/types/uiTypes";

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

    // useCallback이나 useMemo나 밖으로 빼야 할지 생각!
    // 콜스택 매우 많이 쌓이는 데 괜찮을지 생각해보자 30일 기준 348회
    // 클라이언트 사이트에서 하는 방법
    /* const getDailyDiffRatio = (data: [], rowIdx: number, colKey: string | number ) => {
        
        if(!data || !colKey) return;
        
        let diff;
        if(isAsc) {
            if(!rowIdx) return; 
            diff = (((data[rowIdx - 1][colKey])*1000 - (data[rowIdx][colKey]*1000))/1000);
        } else {
            if(rowIdx == data.length - 1) return;
            diff = (((data[rowIdx][colKey])*1000 - (data[rowIdx + 1][colKey]*1000))/1000);
        }
        const styleName = "ml-1" + (diff > 0 ? " text-blue-500" : diff < 0 ? " text-red-500" : "");

        return (
            <span key={(diff + rowIdx)} className={styleName} style={{fontSize: '10px'}}>
                {`${diff}`}
            </span>
        )
    }; */

    const diff = 0;

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
                                    <span key={(rowIdx + colIdx)} className={(diff > 0 ? "text-blue-500" : diff < 0 ? "text-red-500" : "") + " ml-1"} style={{fontSize: '10px'}}>
                                        {col.key != 'ymd' && dataDiff[rowIdx][col.key]}
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