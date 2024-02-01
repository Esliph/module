import { Console } from '@esliph/console'
import { Construtor } from '../@types'
import { Adapter } from '../adapter'
import { LocalAdapter } from '../common/http/adapter-local'
import { ApplicationModule, ApplicationOptions } from '../core/app'

export type BootstrapOptions = ApplicationOptions & { logger: Console<any, any, any, any> }

export async function Bootstrap(appModule: Construtor, options: Partial<BootstrapOptions> = {}, adapters: Adapter[] = []) {
    if (options.logger) {
        ApplicationModule.useLogger(options.logger)
    }
    ApplicationModule.useAdapter(new LocalAdapter())

    adapters.map(adapter => {
        ApplicationModule.useAdapter(adapter)
    })

    await ApplicationModule.fabric(appModule, options)

    return ApplicationModule
}
