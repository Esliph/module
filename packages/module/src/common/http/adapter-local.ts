import { Server } from '@esliph/http'
import { Adapter, AdapterLoadEventOptions } from '../../adapter'
import { METADATA_HTTP_ROUTER_HANDLER_KEY } from '../../constants'

export class LocalAdapter implements Adapter<Server<any>> {
    private static instance = new Server<any>()

    adapterKey = METADATA_HTTP_ROUTER_HANDLER_KEY

    listen(args: { port: number }, handler: () => any): void {
        handler()
    }

    loadEvent({ handlers, event, method }: AdapterLoadEventOptions) {
        // @ts-expect-error
        this.instance[method](event, {}, ...handlers)
    }

    get instance() {
        return LocalAdapter.instance
    }
}
