import { DecoratorMetadata, Metadata } from '@esliph/metadata'
import { METADATA_GUARD_CONFIG_KEY, METADATA_GUARD_KEY } from '../../constants'

export type GuardConfig = {
    name: string
}

export function Guard(config: Partial<GuardConfig> = {}) {
    function handle(target: any, key: string, descriptor: PropertyDescriptor) {
        let othersConfig: any[] = []

        try {
            othersConfig = Metadata.Get.Method<GuardConfig[]>(METADATA_GUARD_CONFIG_KEY, target.constructor, key) ?? []
        } catch (err: any) {
            othersConfig = []
        }

        const value = [...othersConfig, config]

        Metadata.Create.Method({ key: METADATA_GUARD_CONFIG_KEY, value }, target, key)
    }

    return DecoratorMetadata.Create.Method({ key: METADATA_GUARD_KEY, value: true }, handle)
}
