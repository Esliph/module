import { ResultException } from '@esliph/common'
import { Injection } from '@esliph/injection'
import { Metadata } from '@esliph/metadata'
import { Console } from '@esliph/console'
import { Client } from '@esliph/http'
import { Listener } from '../services/observer.service'
import { Construtor } from '../@types'
import { Logger } from '../services/logger.service'
import { ModuleConfig, ServiceConfig } from '../common/module'
import {
    METADATA_CONTROLLER_CONFIG_KEY,
    METADATA_EVENT_CONFIG_KEY,
    METADATA_EVENT_HANDLER_KEY,
    METADATA_FILTER_CONFIG_KEY,
    METADATA_GUARD_CONFIG_KEY,
    METADATA_MODULE_CONFIG_KEY,
    METADATA_SERVICE_CONFIG_KEY,
} from '../constants'
import { getMethodNamesByClass, isInstance } from '../util'
import { Adapter } from '../adapter'
import { isModule, isFilter, isGuard } from '../common/utils'
import { GuardConfig, FilterConfig } from '../common/module'
import { EventOptions } from '../common/event/decorator'

export type ApplicationOptions = { log?: { load?: boolean; eventHttp?: boolean; eventListener?: boolean } }

export class ApplicationModule {
    static listener = new Listener()
    static client = new Client()
    static adapters: Adapter[] = []
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

    static fabric(appModule: Construtor, options: ApplicationOptions = {}) {
        ApplicationModule.options = options

        ApplicationModule.logLoad('Loading components...')

        if (!isModule(appModule)) {
            throw new ResultException({ title: `Class "${appModule.name}" is not a module`, message: `Apply decorator "Module" in class "${appModule.name}"` })
        }

        ApplicationModule.appModule = appModule

        ApplicationModule.initComponents()
        ApplicationModule.logLoad('Components initialized')
    }

    static useLogger(logger: Console<any, any, any, any>) {
        ApplicationModule.logger = logger

        Injection.whenCall('global.service.logger').use(logger.constructor as any)
    }

    static useAdapter(adapter: Adapter) {
        ApplicationModule.adapters.push(adapter)

        ApplicationModule.logLoad(`Loading Adapter "${adapter.constructor.name}"`)
    }

    private static initComponents() {
        const modules = ApplicationModule.loadModule(ApplicationModule.appModule, true)

        ApplicationModule.controllers = modules.controllers
        ApplicationModule.providers = modules.providers

        ApplicationModule.initFilters()
        ApplicationModule.initControllers()
        ApplicationModule.initObserverListeners()
        ApplicationModule.loadProviders()
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

            if (imp.onLoad) {
                imp.onLoad()
            }

            ApplicationModule.logLoad(`Loading${metadata.context ? ` ${metadata.context}` : ' Service'} "${imp.name}"`)
        })

        configModule.imports.map(module => {
            const configs = ApplicationModule.loadModule(module)

            configs.modules.map(module => modules.push(module))
            configs.controllers.map(controller => controllers.push(controller))
            configs.providers.map(provider => providers.push(provider))
        })

        return {
            modules: [...modules, ...configModule.imports],
            controllers,
            providers,
        }
    }

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
        const events = ApplicationModule.getAllEventsOfController(controller, instance)

        events.map(event => {
            event.adapter.loadEvent({ ...event.metadata, handlers: event.handlers })
        })
    }

    private static getAllEventsOfController(controller: Construtor, instance: any) {
        return ApplicationModule.getEventsOfTheController(controller).map(event => {
            const adapter = ApplicationModule.getAdapterByMetadataKey(event.adapterKey)

            if (!adapter) {
                throw new Error(`Adapter key "${event.adapterKey}" not found`)
            }

            ApplicationModule.logLoad(
                `Loading Event HTTP Adapter "${adapter.constructor.name}" ${event.metadata.method.toUpperCase()} "${event.metadata.event}"`
            )

            const handlers: ((...args: any[]) => any)[] = []

            if (isGuard(controller, event.method)) {
                let methodsMetadata = Metadata.Get.Method<GuardConfig[]>(METADATA_GUARD_CONFIG_KEY, controller, event.method) || []

                if (!Array.isArray(methodsMetadata)) {
                    methodsMetadata = [methodsMetadata]
                }

                methodsMetadata.map(methodMetadata => {
                    const filter = ApplicationModule.filters.find(filter => filter.metadata.name == methodMetadata.name)

                    if (!filter) {
                        throw new ResultException({ title: 'Apply Guard in Event', message: `Guard "${methodMetadata.name}" not found` })
                    }

                    ApplicationModule.logLoad(`Loading Guard HTTP "${filter.class.name}" in "${event.metadata.event}"`)

                    handlers.push(async (req, res) => {
                        const response = await filter.instance.perform(req, res)

                        return response
                    })
                })

            }

            handlers.push(async (req, res) => {
                const response = await instance[event.method](req, res)

                return response
            })

            return { ...event, handlers, adapter }
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
                    `${arg.request.method} ${arg.request.name} {"error": "${arg.response.getError().message}"${arg.request.headers.playerId ? `, "player" ${arg.request.headers.playerId}}` : '}'
                    }`,
                    null,
                    { context: '[HTTP]' }
                )
            }
        })
    }

    private static loadProviders() {
        ApplicationModule.providers.forEach(imp => {
            if (!isInstance(imp)) {
                return
            }

            if (imp.onStart) {
                imp.onStart()
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

    private static getEventsOfTheController(controller: Construtor) {
        const { prefix = '' } = Metadata.Get.Class<{ prefix: string }>(METADATA_CONTROLLER_CONFIG_KEY, controller) || { prefix: '' }

        const events = ([] as any[]).concat(
            ...ApplicationModule.adapters.map(({ adapterKey }) => {
                return ApplicationModule.getMethodsInClassByMetadataKey<{ options: EventOptions, event: string; method: string; adapterKey: string }>(controller, adapterKey).map(
                    event => ({
                        options: event.metadata.options,
                        method: event.method,
                        adapterKey,
                        metadata: {
                            event: (event.metadata.options.prefix || prefix) + event.metadata.event,
                            method: event.metadata.method
                        }
                    })
                )
            })
        ) as {
            method: string
            adapterKey: string
            metadata: {
                event: string
                method: string
            }
        }[]

        return events
    }

    private static getMethodsInClassByMetadataKey<Metadata = any>(classConstructor: Construtor, key: string) {
        return getMethodNamesByClass(classConstructor)
            .map(methodName => ({ method: methodName, metadata: Metadata.Get.Method<Metadata>(key, classConstructor, methodName) }))
            .filter(({ metadata }) => !!metadata)
    }

    private static getAdapterByMetadataKey(key: string) {
        return ApplicationModule.adapters.find(({ adapterKey }) => adapterKey == key) || null
    }

    static getAppModule() {
        return ApplicationModule.appModule
    }
    static getOptions() {
        return ApplicationModule.options
    }
    static getControllers() {
        return ApplicationModule.controllers
    }
    static getProviders() {
        return ApplicationModule.providers
    }
    static getFilters() {
        return ApplicationModule.filters
    }
}
