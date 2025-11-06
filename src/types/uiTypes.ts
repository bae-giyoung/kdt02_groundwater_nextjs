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

// 강수.가뭄 민감도 데이터 타입
export interface SensitivityRecord {
  station: string;
  start_value: number;
  max_value: number;
  min_value: number;
  increase_if_rainfall: number;
  decrease_if_drought: number;
  range_variation: number;
  sensitive_type?: string;
}

export interface SensitivityDataset {
  num_stations: number;
  top5_rainfall_increase: SensitivityRecord[];
  top5_drought_decrease: SensitivityRecord[];
  top5_largest_variation: SensitivityRecord[];
  stations_analisys: SensitivityRecord[];
}