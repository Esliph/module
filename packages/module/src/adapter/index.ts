export type AdapterLoadEventOptions = { event: string; method: string; handlers: (...args: any[]) => any[] }

export abstract class Adapter {
    abstract loadEvent(event: AdapterLoadEventOptions): void
}
