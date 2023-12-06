import { METADATA_EVENT_CONFIG_KEY, METADATA_EVENT_HANDLER_KEY } from '../../constants'
import { Decorator } from '@esliph/decorator'
import { Metadata } from '@esliph/metadata'

export function OnEvent(name: string) {
    function handle(target: any, key: string, descriptor: PropertyDescriptor) {
        Metadata.Create.Method({ key: METADATA_EVENT_CONFIG_KEY, value: { event: name } }, target, key)
        Metadata.Create.Method({ key: METADATA_EVENT_HANDLER_KEY, value: true }, target, key)
    }

    return Decorator.Create.Method(handle)
}
