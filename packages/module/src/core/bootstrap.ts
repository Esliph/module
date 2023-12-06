import { Console } from '@esliph/console'
import { Construtor } from '../@types'
import { Adapter } from '../adapter'
import { LocalAdapter } from '../common/http/adapter-local'
import { ApplicationModule, ApplicationOptions } from '../core/app'

export type BootstrapOptions = ApplicationOptions & { logger: Console; adapters: Adapter[] }

export function Bootstrap(appModule: Construtor, options: Partial<BootstrapOptions> = {}) {
    if (options.logger) {
        ApplicationModule.useLogger(options.logger)
    }
    ApplicationModule.useAdapter(new LocalAdapter())
    if (options.adapters) {
        options.adapters.map(adapter => {
            ApplicationModule.useAdapter(adapter)
        })
    }

    ApplicationModule.fabric(appModule, options)
    ApplicationModule.listen(options.port || 0)

    return ApplicationModule
}
