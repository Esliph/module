import { Console } from '@esliph/console'
import { Construtor } from '../@types'
import { ApplicationModule } from '../core/app'

export function Bootstrap(appModule: Construtor, options: { logLoad?: boolean; logEventHttp?: boolean; logEventListener?: boolean; logger?: Console } = {}) {
    if (options.logger) {
        ApplicationModule.useLogger(options.logger)
    }

    ApplicationModule.fabric(appModule, { log: { load: options.logLoad, eventHttp: options.logEventHttp, eventListener: options.logEventListener } })
    ApplicationModule.listen(0)

    return ApplicationModule
}
