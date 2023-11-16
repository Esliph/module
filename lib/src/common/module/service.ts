import { DecoratorMetadata, Metadata } from '@esliph/metadata'
import { Injection } from '@esliph/injection'
import { METADATA_SERVICE_CONFIG_KEY, METADATA_SERVICE_KEY } from '../../constants'

export type ServiceConfig = {
    name: string,
    context: 'Use Case' | 'Repository' | 'Service'
}

export function Service(config: Partial<ServiceConfig> = {}) {
    function handle(constructor: any) {
        if (config.name) {
            Injection.Injectable(config.name, { ignoreIfExists: true })(constructor)
        }

        if (!config.context) {
            config.context = 'Service'
        }

        Metadata.Create.Class({ key: METADATA_SERVICE_CONFIG_KEY, value: config }, constructor)
    }

    return DecoratorMetadata.Create.Class({ key: METADATA_SERVICE_KEY, value: true }, handle)
}
