import { Controller, Module, Bootstrap } from '../../../module/src'
import { Decorator } from '@esliph/decorator'
import { Metadata } from '@esliph/metadata'

export const METADATA_ADAPTER_FASTIFY_HTTP_ROUTER_HANDLER_KEY = 'adapter.adapter.http.router.event'

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

@Controller()
class UserController {
    @Get('/hello')
    hello() {}
}

@Module({
    controllers: [UserController],
})
class UserModule {}

Bootstrap(UserModule, { log: { eventHttp: true, eventListener: true, load: true }, port: 8080 })
