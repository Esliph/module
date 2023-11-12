import { Construtor } from '@@types/index'
import { DecoratorMetadata, Metadata } from '@esliph/metadata'
import { METADATA_MODULE_CONFIG_KEY, METADATA_MODULE_KEY } from '@constants/index'
import { isController } from '@common/controller'
import { isService } from '@common/service'
import { ResultException } from '@esliph/common'
import { isInstance } from '@util/index'
import { Injection } from '@esliph/injection'

type ProviderOptions = {
    whenCall: string
    use: Construtor | string
}

export type ModuleConfig = {
    imports: Construtor[]
    controllers: Construtor[]
    providers: (Construtor | Partial<ProviderOptions>)[]
}

export function Module(config: Partial<ModuleConfig> = {}) {
    function handle(constructor: any) {
        if (config.controllers) {
            config.controllers.forEach(controller => {
                if (!isController(controller)) {
                    throw new ResultException({
                        title: `Class "${controller.name}" is not a controller`,
                        message: `Apply decorator "Controller" in class "${controller.name}"`
                    })
                }
            })
        }
        if (config.providers) {
            config.providers.forEach(service => {
                if (isInstance(service)) {
                    const ser = service as Construtor

                    if (!isService(ser)) {
                        throw new ResultException({
                            title: `Class "${ser.name}" is not a service`,
                            message: `Apply decorator "Service" in class "${ser.name}"`
                        })
                    }

                    return
                }

                const serviceOptions = service as Partial<ProviderOptions>

                if (!serviceOptions.use || !serviceOptions.whenCall) {
                    return
                }

                Injection.whenCall(serviceOptions.whenCall).use(serviceOptions.use)
            })
        }

        Metadata.Create.Class(
            {
                key: METADATA_MODULE_CONFIG_KEY,
                value: { imports: config.imports || [], controllers: config.controllers || [], providers: config.providers || [] }
            },
            constructor
        )
    }

    return DecoratorMetadata.Create.Class({ key: METADATA_MODULE_KEY, value: true }, handle)
}
