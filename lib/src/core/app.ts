import { ResultException } from '@esliph/common'
import { Injection } from '@esliph/injection'
import { Listener } from '@services/observer.service'
import { Metadata } from '@esliph/metadata'
import { Client, Server } from '@esliph/http'
import { Construtor } from '@@types/index'
import { Logger } from '@services/logger.service'
import { ModuleConfig, ServiceConfig } from '@common/module/decorator'
import { isModule } from '@common/utils'
import { METADATA_EVENT_CONFIG_KEY, METADATA_EVENT_HANDLER_KEY, METADATA_FILTER_CONFIG_KEY, METADATA_GUARD_CONFIG_KEY, METADATA_HTTP_ROUTER_HANDLER_KEY, METADATA_MODULE_CONFIG_KEY, METADATA_SERVICE_CONFIG_KEY } from '@constants/index'
import { getMethodNamesByClass, isInstance } from '@util/index'
import { isFilter } from '@common/utils'
import { isGuard } from '@common/utils'
import { GuardConfig, FilterConfig } from '@common/module/decorator'

type ApplicationOptions = { serverLocal?: boolean, log?: { load?: boolean, eventHttp?: boolean, eventListener?: boolean } }

export class Application {
    static server = new Server()
    static listener = new Listener()
    static client = new Client()
    static logger = new Logger({ context: 'Server' })
    private static appModule: Construtor
    private static options: ApplicationOptions
    private static controllers: Construtor[]
    private static providers: any[]
    private static filters: {
        instance: any;
        class: any;
        metadata: FilterConfig;
    }[]

    static listen(port: number) {
        if (Application.options.serverLocal) {
            Application.logger.log('Server started')
            console.log()
        }
    }

    static fabric(appModule: Construtor, options: ApplicationOptions = {}) {
        Application.logLoad('Loading components...')
        if (!isModule(appModule)) {
            throw new ResultException({ title: `Class "${appModule.name}" is not a module`, message: `Apply decorator "Module" in class "${appModule.name}"` })
        }

        Application.appModule = appModule
        Application.options = options

        Application.initComponents()
        Application.logLoad('Components initialized')
    }

    private static initComponents() {
        const modules = Application.initModule(Application.appModule, true)

        Application.controllers = modules.controllers
        Application.providers = modules.providers

        Application.initFilters()
        Application.initControllers()
        Application.initObserverListeners()
    }

    private static initModule(module: Construtor, include = false) {
        Application.logLoad(`Loading Module "${module.name}"`)

        const configModule = Metadata.Get.Class<ModuleConfig>(METADATA_MODULE_CONFIG_KEY, module)

        const modules: Construtor[] = []
        const controllers: Construtor[] = configModule.controllers
        const providers: any[] = configModule.providers

        if (include) {
            modules.push(module)
        }

        configModule.imports.map(module => {
            const configs = Application.initModule(module)

            configs.modules.forEach(imp => modules.push(imp))
            configs.controllers.forEach(imp => controllers.push(imp))
            configs.providers.forEach(imp => {
                providers.push(imp)

                if (!isInstance(imp)) { return }

                const metadata = Metadata.Get.Class<ServiceConfig>(METADATA_SERVICE_CONFIG_KEY, imp) || {}

                Application.logLoad(`Loading${metadata.context ? ` ${metadata.context}` : ' Service'} "${imp.name}"`)
            })
        })

        return {
            modules: [...modules, ...configModule.imports],
            controllers,
            providers
        }
    }

    private static initFilters() {
        Application.filters = Application.providers.filter(provider => isInstance(provider) && isFilter(provider)).map(filter => ({ instance: Injection.resolve(filter), class: filter, metadata: Metadata.Get.Class<FilterConfig>(METADATA_FILTER_CONFIG_KEY, filter) }))
    }

    private static initControllers() {
        Application.controllers.map(controller => Application.initController(controller))
    }

    private static initController(controller: Construtor) {
        Application.logLoad(`Loading Controller "${controller.name}"`)

        const instance = Injection.resolve(controller)

        Application.loadEventsHttp(controller, instance)
        Application.loadEventsListener(controller, instance)
    }

    private static loadEventsHttp(controller: Construtor, instance: any) {
        const events = Application.getMethodsInClassByMetadataKey<{ event: string; method: string }>(controller, METADATA_HTTP_ROUTER_HANDLER_KEY)

        events.map(event => {
            Application.logLoad(`Loading Event HTTP ${event.metadata.method.toUpperCase()} "${event.metadata.event}"`)

            const handlers: ((...args: any[]) => any)[] = []

            if (isGuard(controller, event.method)) {
                const methodMetadata = Metadata.Get.Method<GuardConfig>(METADATA_GUARD_CONFIG_KEY, controller, event.method)

                const filter = Application.filters.find(filter => filter.metadata.name = methodMetadata.name)

                if (filter && filter.instance.perform) {
                    Application.logLoad(`Loading Guard HTTP "${filter.class.name}" in "${event.metadata.event}"`)

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
            Application.getServer()[event.metadata.method](event.metadata.event, ...handlers)
        })
    }

    private static loadEventsListener(controller: Construtor, instance: any) {
        const events = Application.getMethodsInClassByMetadataKey<{ event: string; method: string }>(controller, METADATA_EVENT_HANDLER_KEY).map(event => ({ ...event, event: Metadata.Get.Method<{ event: string }>(METADATA_EVENT_CONFIG_KEY, controller, event.method).event }))

        events.forEach(event => {
            Application.logLoad(`Loading Event Listener "${event.event}"`)

            Application.listener.on(event.event, async body => {
                Application.logListener(event.event)
                await instance[event.method](body)
            })
        })
    }

    private static initObserverListeners() {
        Application.client.on('request/end', arg => {
            if (arg.response.isSuccess()) {
                Application.logHttp(`${arg.request.method} ${arg.request.name}${arg.request.headers.playerId ? ` {"player": ${arg.request.headers.playerId}}` : ''}`)
            } else {
                Application.logger.error(`${arg.request.method} ${arg.request.name} {"error": "${arg.response.getError().message}"${arg.request.headers.playerId ? `, "player" ${arg.request.headers.playerId}}` : '}'}`, null, { context: '[HTTP]' })
            }
        })
    }

    private static logLoad(message: any) {
        if (!Application.options?.log?.load) { return }

        Application.logger.log(message)
    }

    private static logHttp(message: any) {
        if (!Application.options?.log?.eventHttp) { return }

        Application.logger.log(message, null, { context: '[HTTP]' })
    }

    private static logListener(message: any) {
        if (!Application.options?.log?.eventListener) { return }

        Application.logger.log(message, null, { context: '[LISTENER]' })
    }

    private static getMethodsInClassByMetadataKey<Metadata = any>(classConstructor: Construtor, key: string) {
        return getMethodNamesByClass(classConstructor).map(methodName => ({ method: methodName, metadata: Metadata.Get.Method<Metadata>(key, classConstructor, methodName) })).filter(({ metadata }) => !!metadata)
    }

    private static getServer() {
        return !Application.options.serverLocal ? Application.server : Application.server
    }
}
