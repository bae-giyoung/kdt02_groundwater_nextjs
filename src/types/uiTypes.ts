import genInfo from "@/data/gennumInfo.json";
export interface UserType {
  userId: string,
  username: string,
  roles: string,
}

export interface UserErrorType {
  code: number,
  message: string
}

export type GenInfo = typeof genInfo;
export type GenInfoKey = keyof typeof genInfo;
export type GenInfoValue = typeof genInfo[GenInfoKey];

// 현황테이블 타입
export type DashboardTableRow = Record<string, string | number | null>;
export type DashboardTableDiffRow = Record<string, string | number | null>;
export type DashboardTableData = {
    tableRows?: DashboardTableRow[];
    tableDiffRows?: DashboardTableDiffRow[];
}