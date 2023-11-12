import { Injection } from '@esliph/injection'
import { DecoratorMetadata, Metadata } from '@esliph/metadata'
import { METADATA_CONTROLLER_CONFIG_KEY, METADATA_CONTROLLER_KEY } from '../../constants'

export type ControllerConfig = {}

export function Controller(config: Partial<ControllerConfig> = {}) {
    function handle(constructor: any) {
        Metadata.Create.Class({ key: METADATA_CONTROLLER_CONFIG_KEY, value: config }, constructor)
        Injection.Injectable()(constructor)
    }

    return DecoratorMetadata.Create.Class({ key: METADATA_CONTROLLER_KEY, value: true }, handle)
}
