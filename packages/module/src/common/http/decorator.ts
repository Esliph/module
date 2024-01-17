import { Decorator } from '@esliph/decorator'
import { Metadata } from '@esliph/metadata'
import { METADATA_HTTP_ROUTER_HANDLER_KEY } from '../../constants'
import { EventOptions } from '../event/decorator'

export function Get(name: string, options: EventOptions = {}) {
    function handle(target: any, key: string, descriptor: PropertyDescriptor) {
        onEvent('get', name, key, target, options)
    }

    return Decorator.Create.Method(handle)
}
export function Post(name: string, options: EventOptions = {}) {
    function handle(target: any, key: string, descriptor: PropertyDescriptor) {
        onEvent('post', name, key, target, options)
    }

    return Decorator.Create.Method(handle)
}
export function Delete(name: string, options: EventOptions = {}) {
    function handle(target: any, key: string, descriptor: PropertyDescriptor) {
        onEvent('delete', name, key, target, options)
    }

    return Decorator.Create.Method(handle)
}
export function Head(name: string, options: EventOptions = {}) {
    function handle(target: any, key: string, descriptor: PropertyDescriptor) {
        onEvent('head', name, key, target, options)
    }

    return Decorator.Create.Method(handle)
}
export function Options(name: string, options: EventOptions = {}) {
    function handle(target: any, key: string, descriptor: PropertyDescriptor) {
        onEvent('options', name, key, target, options)
    }

    return Decorator.Create.Method(handle)
}
export function Patch(name: string, options: EventOptions = {}) {
    function handle(target: any, key: string, descriptor: PropertyDescriptor) {
        onEvent('patch', name, key, target, options)
    }

    return Decorator.Create.Method(handle)
}
export function Put(name: string, options: EventOptions = {}) {
    function handle(target: any, key: string, descriptor: PropertyDescriptor) {
        onEvent('put', name, key, target, options)
    }

    return Decorator.Create.Method(handle)
}

function onEvent(method: string, name: string, key: string, target: any, options: EventOptions = {}) {
    Metadata.Create.Method({ key: METADATA_HTTP_ROUTER_HANDLER_KEY, value: { event: name, method, options } }, target, key)
}
