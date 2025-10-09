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
        <div className="table-container overflow-x-auto">
            <table className="min-w-full border-collapse border text-sm text-left">
                <thead className="bg-gray-ed">
                    <tr>
                        {headers.map((label, idx) => (
                            <th scope="col" key={label + idx} className="border px-3 py-2 font-medium">
                                {label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIdx) => ( // O(n^2)인데 어쩔 수 없나 => 작은 데이터용이므로 놔두자
                        <tr key={rowIdx} className="even: bg-gray-50 odd:bg-white">
                            {columns.map((col, colIdx) => (
                                <td key={colIdx} className={"border px-3 py-2" + ((col.key == emphasis) ? " bg-[#D6ECEA88] font-bold" : "")}>
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