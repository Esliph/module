export type AdapterLoadEventOptions = { statusCode: number, event: string; method: string; handlers: ((...args: any[]) => any)[] }

export abstract class Adapter<T = any> {
    abstract adapterKey: string
    abstract get instance(): T
    abstract loadEvent(event: AdapterLoadEventOptions): void
}
