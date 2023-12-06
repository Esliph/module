export type Construtor<T = any> = new (...args: any[]) => T
export type ID = number
export type PayloadJWT = {
    sub: number
    exp: number
    iat: number
}