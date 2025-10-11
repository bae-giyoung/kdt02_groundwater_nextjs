"use client";
import { memo, useMemo } from "react";

type Column<T> = {
    key: keyof T;
    label: string;
}

type TableProps<T> = {
    data: T[];
    columns: Column<T>[];
    emphasis?: string;
}

function CustomTable<T extends Record<string, any>>({data, columns, emphasis}: TableProps<T>) {
    const headers = useMemo(() => columns.map((col) => col.label), [columns]);
    return (
        <div className="table-style01 table-container overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead>
                    <tr>
                        {headers.map((label, idx) => (
                            <th scope="col" key={label + idx}>
                                {label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                            {columns.map((col, colIdx) => (
                                <td key={colIdx} className={((col.key == emphasis) ? " bg-[#D6ECEA88] font-bold" : "")}>
                                    {row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default memo(CustomTable);