import { Decorator } from '@esliph/decorator'
import { Metadata } from '@esliph/metadata'
import { Adapter, AdapterLoadEventOptions } from '@esliph/module/dist/adapter'
import { Server } from 'socket.io'
export * as SocketIO from 'socket.io'

const METADATA_ADAPTER_SOCKETIO_HTTP_ROUTER_HANDLER_KEY = 'socket-io.adapter.http.router.event'

export function On(name: string) {
    function handle(target: any, key: string, descriptor: PropertyDescriptor) {
        onEvent('put', name, key, target)
    }

    return Decorator.Create.Method(handle)
}

function onEvent(method: string, name: string, key: string, target: any) {
    Metadata.Create.Method({ key: METADATA_ADAPTER_SOCKETIO_HTTP_ROUTER_HANDLER_KEY, value: { event: name, method } }, target, key)
}

export class AdapterSocketIO implements Adapter<Server> {
    // @ts-expect-error
    static instance: Server = null

    adapterKey = METADATA_ADAPTER_SOCKETIO_HTTP_ROUTER_HANDLER_KEY

    loadEvent(event: AdapterLoadEventOptions) {}

    get instance() {
        return AdapterSocketIO.instance
    }
}
