import { DecoratorMetadata, Metadata } from '@esliph/metadata'
import { METADATA_GUARD_CONFIG_KEY, METADATA_GUARD_KEY } from '../../constants'

export type GuardConfig = {
    name: string
}

export function Guard(config: Partial<GuardConfig> = {}) {
    function handle(target: any, key: string, descriptor: PropertyDescriptor) {
        Metadata.Create.Method({ key: METADATA_GUARD_CONFIG_KEY, value: config }, target, key)
    }

    return DecoratorMetadata.Create.Method({ key: METADATA_GUARD_KEY, value: true }, handle)
}
