import { ResultException } from '@esliph/common'
import { Injection } from '@esliph/injection'
import { Metadata } from '@esliph/metadata'
import { Console } from '@esliph/console'
import { Client, Server } from '@esliph/http'
import { Listener } from '../services/observer.service'
import { Construtor } from '../@types'
import { Logger } from '../services/logger.service'
import { ModuleConfig, ServiceConfig } from '../common/module'
import {
    METADATA_EVENT_CONFIG_KEY,
    METADATA_EVENT_HANDLER_KEY,
    METADATA_FILTER_CONFIG_KEY,
    METADATA_GUARD_CONFIG_KEY,
    METADATA_HTTP_ROUTER_HANDLER_KEY,
    METADATA_MODULE_CONFIG_KEY,
    METADATA_SERVICE_CONFIG_KEY,
} from '../constants'
import { getMethodNamesByClass, isInstance } from '../util'
import { isModule, isFilter, isGuard } from '../common/utils'
import { GuardConfig, FilterConfig } from '../common/module'

type ApplicationOptions = { serverLocal?: boolean; log?: { load?: boolean; eventHttp?: boolean; eventListener?: boolean } }

export class ApplicationModule {
    static server = new Server()
    static listener = new Listener()
    static client = new Client()
    static logger: Console<any, any, any, any> = new Logger()
    private static appModule: Construtor
    private static options: ApplicationOptions
    private static controllers: Construtor[]
    private static providers: any[]
    private static filters: {
        instance: any
        class: any
        metadata: FilterConfig
    }[]

    static listen(port: number) {
        if (ApplicationModule.options.serverLocal) {
            ApplicationModule.logger.log('Server started')
            console.log()
        }
    }

    static fabric(appModule: Construtor, options: ApplicationOptions = {}) {
        ApplicationModule.logLoad('Loading components...')
        if (!isModule(appModule)) {
            throw new ResultException({ title: `Class "${appModule.name}" is not a module`, message: `Apply decorator "Module" in class "${appModule.name}"` })
        }

        ApplicationModule.appModule = appModule
        ApplicationModule.options = options

        ApplicationModule.initComponents()
        ApplicationModule.logLoad('Components initialized')
    }

    static useLogger(logger: Console) {
        ApplicationModule.logger = logger

        Injection.whenCall('global.service.logger').use(logger.constructor)
    }

    private static initComponents() {
        const modules = ApplicationModule.loadModule(ApplicationModule.appModule, true)

        ApplicationModule.controllers = modules.controllers
        ApplicationModule.providers = modules.providers

        ApplicationModule.initFilters()
        ApplicationModule.initControllers()
        ApplicationModule.initObserverListeners()
    }

    private static loadModule(module: Construtor, include = false) {
        ApplicationModule.logLoad(`Loading Module "${module.name}"`)

        const configModule = Metadata.Get.Class<ModuleConfig>(METADATA_MODULE_CONFIG_KEY, module)

        const modules: Construtor[] = []
        const controllers: Construtor[] = configModule.controllers
        const providers: any[] = configModule.providers

        if (include) {
            modules.push(module)
        }

        providers.forEach(imp => {
            if (!isInstance(imp)) {
                return
            }

            const metadata = Metadata.Get.Class<ServiceConfig>(METADATA_SERVICE_CONFIG_KEY, imp) || {}

            ApplicationModule.logLoad(`Loading${metadata.context ? ` ${metadata.context}` : ' Service'} "${imp.name}"`)
        })

        configModule.imports.map(module => {
            const configs = ApplicationModule.loadModule(module)

            configs.modules.forEach(imp => {
                modules.push(imp)
            })
            configs.controllers.forEach(imp => {
                controllers.push(imp)
            })
            configs.providers.forEach(imp => {
                providers.push(imp)
            })
        })

        return {
            modules: [...modules, ...configModule.imports],
            controllers,
            providers,
        }
    }

    private static getAllModules() {}

    private static initFilters() {
        ApplicationModule.filters = ApplicationModule.providers
            .filter(provider => isInstance(provider) && isFilter(provider))
            .map(filter => ({
                instance: Injection.resolve(filter),
                class: filter,
                metadata: Metadata.Get.Class<FilterConfig>(METADATA_FILTER_CONFIG_KEY, filter),
            }))
    }

    private static initControllers() {
        ApplicationModule.controllers.map(controller => ApplicationModule.initController(controller))
    }

    private static initController(controller: Construtor) {
        ApplicationModule.logLoad(`Loading Controller "${controller.name}"`)

        const instance = Injection.resolve(controller)

        ApplicationModule.loadEventsHttp(controller, instance)
        ApplicationModule.loadEventsListener(controller, instance)
    }

    private static loadEventsHttp(controller: Construtor, instance: any) {
        const events = ApplicationModule.getMethodsInClassByMetadataKey<{ event: string; method: string }>(controller, METADATA_HTTP_ROUTER_HANDLER_KEY)

        events.map(event => {
            ApplicationModule.logLoad(`Loading Event HTTP ${event.metadata.method.toUpperCase()} "${event.metadata.event}"`)

            const handlers: ((...args: any[]) => any)[] = []

            if (isGuard(controller, event.method)) {
                const methodMetadata = Metadata.Get.Method<GuardConfig>(METADATA_GUARD_CONFIG_KEY, controller, event.method)

                const filter = ApplicationModule.filters.find(filter => (filter.metadata.name = methodMetadata.name))

                if (filter && filter.instance.perform) {
                    ApplicationModule.logLoad(`Loading Guard HTTP "${filter.class.name}" in "${event.metadata.event}"`)

                    handlers.push(async (req, res) => {
                        const response = await filter.instance.perform(req, res)

                        return response
                    })
                }
            }

            handlers.push(async (req, res) => {
                const response = await instance[event.method](req, res)

                return response
            })

            // @ts-expect-error
            ApplicationModule.getServer()[event.metadata.method](event.metadata.event, ...handlers)
        })
    }

    private static loadEventsListener(controller: Construtor, instance: any) {
        const events = ApplicationModule.getMethodsInClassByMetadataKey<{ event: string; method: string }>(controller, METADATA_EVENT_HANDLER_KEY).map(
            event => ({ ...event, event: Metadata.Get.Method<{ event: string }>(METADATA_EVENT_CONFIG_KEY, controller, event.method).event })
        )

        events.forEach(event => {
            ApplicationModule.logLoad(`Loading Event Listener "${event.event}"`)

            ApplicationModule.listener.on(event.event, async body => {
                ApplicationModule.logListener(event.event)
                await instance[event.method](body)
            })
        })
    }

    private static initObserverListeners() {
        ApplicationModule.client.on('request/end', arg => {
            if (arg.response.isSuccess()) {
                ApplicationModule.logHttp(
                    `${arg.request.method} ${arg.request.name}${arg.request.headers.playerId ? ` {"player": ${arg.request.headers.playerId}}` : ''}`
                )
            } else {
                ApplicationModule.logger.error(
                    `${arg.request.method} ${arg.request.name} {"error": "${arg.response.getError().message}"${
                        arg.request.headers.playerId ? `, "player" ${arg.request.headers.playerId}}` : '}'
                    }`,
                    null,
                    { context: '[HTTP]' }
                )
            }
        })
    }

    private static logLoad(message: any) {
        if (!ApplicationModule.options?.log?.load) {
            return
        }

        ApplicationModule.logger.log(message, null, { context: 'SERVER' })
    }

    private static logHttp(message: any) {
        if (!ApplicationModule.options?.log?.eventHttp) {
            return
        }

        ApplicationModule.logger.log(message, null, { context: 'HTTP' })
    }

    private static logListener(message: any) {
        if (!ApplicationModule.options?.log?.eventListener) {
            return
        }

        ApplicationModule.logger.log(message, null, { context: 'LISTENER' })
    }

    private static getMethodsInClassByMetadataKey<Metadata = any>(classConstructor: Construtor, key: string) {
        return getMethodNamesByClass(classConstructor)
            .map(methodName => ({ method: methodName, metadata: Metadata.Get.Method<Metadata>(key, classConstructor, methodName) }))
            .filter(({ metadata }) => !!metadata)
    }

    private static getServer() {
        return !ApplicationModule.options.serverLocal ? ApplicationModule.server : ApplicationModule.server
    }
}
