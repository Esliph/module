import { Console } from '@esliph/console'
import { Construtor } from '../@types'
import { ApplicationModule, ApplicationOptions } from '../core/app'

export type BootstrapOptions = ApplicationOptions & { logger: Console }

export function Bootstrap(appModule: Construtor, options: Partial<BootstrapOptions> = {}) {
    if (options.logger) {
        ApplicationModule.useLogger(options.logger)
    }
    if (options.adapter) {
        ApplicationModule.useAdapter(options.adapter)
    }

    ApplicationModule.fabric(appModule, options)
    ApplicationModule.listen(options.port || 0)

    return ApplicationModule
}
