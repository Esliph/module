import { Adapter, AdapterLoadEventOptions } from '@esliph/module/dist/adapter'
import { Decorator } from '@esliph/decorator'
import { Metadata } from '@esliph/metadata'
import { Request, EventRouter } from '@esliph/http'
import Fastify from 'fastify'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

const METADATA_ADAPTER_FASTIFY_HTTP_ROUTER_HANDLER_KEY = 'fastify.adapter.http.router.event'

export function Get(name: string) {
    function handle(target: any, key: string, descriptor: PropertyDescriptor) {
        onEvent('get', name, key, target)
    }

    return Decorator.Create.Method(handle)
}
export function Post(name: string) {
    function handle(target: any, key: string, descriptor: PropertyDescriptor) {
        onEvent('post', name, key, target)
    }

    return Decorator.Create.Method(handle)
}
export function Delete(name: string) {
    function handle(target: any, key: string, descriptor: PropertyDescriptor) {
        onEvent('delete', name, key, target)
    }

    return Decorator.Create.Method(handle)
}
export function Head(name: string) {
    function handle(target: any, key: string, descriptor: PropertyDescriptor) {
        onEvent('head', name, key, target)
    }

    return Decorator.Create.Method(handle)
}
export function Options(name: string) {
    function handle(target: any, key: string, descriptor: PropertyDescriptor) {
        onEvent('options', name, key, target)
    }

    return Decorator.Create.Method(handle)
}
export function Patch(name: string) {
    function handle(target: any, key: string, descriptor: PropertyDescriptor) {
        onEvent('patch', name, key, target)
    }

    return Decorator.Create.Method(handle)
}
export function Put(name: string) {
    function handle(target: any, key: string, descriptor: PropertyDescriptor) {
        onEvent('put', name, key, target)
    }

    return Decorator.Create.Method(handle)
}

function onEvent(method: string, name: string, key: string, target: any) {
    Metadata.Create.Method({ key: METADATA_ADAPTER_FASTIFY_HTTP_ROUTER_HANDLER_KEY, value: { event: name, method } }, target, key)
}

export class FastifyAdapter implements Adapter<FastifyInstance> {
    // @ts-expect-error
    static instance: FastifyInstance = null

    adapterKey = METADATA_ADAPTER_FASTIFY_HTTP_ROUTER_HANDLER_KEY

    loadEvent({ handlers, event, method }: AdapterLoadEventOptions) {
        // @ts-expect-error
        this.instance[method](event, async (req: FastifyRequest, res: FastifyReply) => {
            const request = new Request({
                headers: req.headers,
                body: req.body,
                params: { ...req.query as any, ...req.params as any },
                method: req.method as any,
                name: req.routeOptions.url,
            })

            const eventRouter = new EventRouter(request, handlers || ([] as any), true)

            await eventRouter.perform()

            const result = eventRouter.response.getResponse()

            res.status(result.getStatus()).send(result.getResponse())
        })
    }

    listen(args: { port: number }, handler: () => any): void {

    }

    loadInstance(instance: FastifyInstance) {
        FastifyAdapter.loadInstance(instance)
    }

    static loadInstance(instance: FastifyInstance) {
        FastifyAdapter.instance = instance
    }

    get instance() {
        return FastifyAdapter.instance
    }
}
