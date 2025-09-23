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