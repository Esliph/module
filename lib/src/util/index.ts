import { Construtor } from '@@types/index'

export type PartialDeep<T> = {
    [x in keyof T]?: T[x] extends object ? PartialDeep<T[x]> : T[x]
}

export function isInstance(obj: any) {
    return !isObjectLiteral(obj)
}

export function isObjectLiteral(obj: any) {
    return obj !== null && typeof obj === 'object' && obj.constructor === Object
}

export function getMethodNamesByClass(className: Construtor) {
    const prototype = className.prototype
    return Object.getOwnPropertyNames(prototype).filter(name => typeof prototype[name] === 'function' && name !== 'constructor') as string[]
}

export function removeAttributesOfObject<T extends object>(obj: T, ...keys: (keyof T)[]) {
    keys.map(key => {
        delete obj[key]
    })

    return { ...obj }
}
