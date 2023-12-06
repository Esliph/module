import { Console } from '@esliph/console'
import { ClassConstructor } from '@esliph/metadata'
import { Construtor } from '../@types'
import { Adapter } from '../adapter'
import { ApplicationModule, ApplicationOptions } from '../core/app'

export type BootstrapOptions = ApplicationOptions & { logger: Console; adapters: { Adapter: ClassConstructor<Adapter>; metadataKey: string }[] }

export function Bootstrap(appModule: Construtor, options: Partial<BootstrapOptions> = {}) {
    if (options.logger) {
        ApplicationModule.useLogger(options.logger)
    }
    if (options.adapters) {
        options.adapters.map(({ Adapter, metadataKey }) => {
            ApplicationModule.useAdapter({ Adapter, metadataKey })
        })
    }

    ApplicationModule.fabric(appModule, options)
    ApplicationModule.listen(options.port || 0)

    return ApplicationModule
}
