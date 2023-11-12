import { DecoratorMetadata, Metadata } from '@esliph/metadata'
import { Injection } from '@esliph/injection'
import { Request, Response } from '@esliph/http'
import { METADATA_FILTER_KEY, METADATA_FILTER_CONFIG_KEY, METADATA_SERVICE_KEY } from '../../constants'

export type FilterConfig = {
    name: string
}

export function Filter(config: Partial<FilterConfig> = {}) {
    function handle(constructor: any) {
        if (config.name) {
            Injection.Injectable(config.name)(constructor)
        }

        Metadata.Create.Class({ key: METADATA_FILTER_KEY, value: config }, constructor)
        Metadata.Create.Class({ key: METADATA_SERVICE_KEY, value: config }, constructor)
        Metadata.Create.Class({ key: METADATA_FILTER_CONFIG_KEY, value: config }, constructor)
    }

    return DecoratorMetadata.Create.Class({ key: METADATA_FILTER_KEY, value: true }, handle)
}

export abstract class FilterPerform {
    abstract perform(req: Request, res: Response): Promise<any | void>;
}
