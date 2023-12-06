import { Controller, Module, Bootstrap, Guard } from '../index'
import { Decorator } from '@esliph/decorator'
import { Metadata } from '@esliph/metadata'
import Fastify from 'fastify'
import { Filter, FilterPerform } from '../common'
import { Request, Response } from '@esliph/http'

export const METADATA_ADAPTER_HTTP_ROUTER_HANDLER_KEY = 'adapter.adapter.http.router.event'

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
    Metadata.Create.Method({ key: METADATA_ADAPTER_HTTP_ROUTER_HANDLER_KEY, value: { event: name, method } }, target, key)
}

@Filter({ name: 'middleware' })
class UserMiddleware implements FilterPerform {
    async perform(req: Request<any>, res: Response<any>) {
        console.log('!')
    }
}

@Controller()
class UserController {
    @Guard({ name: 'middleware' })
    @Get('/hello')
    hello() {
        return { hello: 'world' }
    }
}

@Module({
    controllers: [UserController],
    providers: [UserMiddleware],
})
class UserModule {}

class FastifyAdapter {
    private static instance = Fastify()

    loadEvent({ handlers, event, method }: { event: string; method: string; handlers: any[] }) {
        this.instance[method](event, {}, ...handlers)
    }

    private get instance() {
        return FastifyAdapter.instance
    }
}

Bootstrap(UserModule, { log: { load: true, eventListener: true, eventHttp: true }, adapter: FastifyAdapter, port: 8080 })
