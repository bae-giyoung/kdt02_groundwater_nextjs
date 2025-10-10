import genInfo from "@/data/gennumInfo.json";
export interface UserType {
    "user": {
    "userId": string,
    "username": string,
    "roles": string,
  },
  "sessionExpiresIn": number
}

export interface LoginErrorType {
  "code": string,
  "message": string
}

export type GenInfo = typeof genInfo;
export type GenInfoKey = keyof typeof genInfo;
export type GenInfoValue = typeof genInfo[GenInfoKey];