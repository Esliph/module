import { Decorator } from '@esliph/decorator'
import { Metadata } from '@esliph/metadata'
import { METADATA_EVENT_CONFIG_KEY, METADATA_EVENT_HANDLER_KEY } from '../../constants'

export type EventOptions = {
    prefix?: string
}

export function OnEvent(name: string, options: EventOptions = {}) {
    function handle(target: any, key: string, descriptor: PropertyDescriptor) {
        Metadata.Create.Method({ key: METADATA_EVENT_CONFIG_KEY, value: { event: name, options } }, target, key)
        Metadata.Create.Method({ key: METADATA_EVENT_HANDLER_KEY, value: true }, target, key)
    }

    return Decorator.Create.Method(handle)
}
