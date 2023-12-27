import { Injection } from '@esliph/injection'
import { DecoratorMetadata, Metadata } from '@esliph/metadata'
import { METADATA_CONTROLLER_CONFIG_KEY, METADATA_CONTROLLER_KEY } from '../../constants'

export type ControllerConfig = { prefix: string }

export function Controller(config: Partial<ControllerConfig> = {}) {
    function handle(constructor: any) {
        Metadata.Create.Class({ key: METADATA_CONTROLLER_CONFIG_KEY, value: config }, constructor)
        Injection.Injectable(undefined, { ignoreIfExists: true })(constructor)
    }

    return DecoratorMetadata.Create.Class({ key: METADATA_CONTROLLER_KEY, value: true }, handle)
}
