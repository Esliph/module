import { FastifyInstance, FastifyRequest } from 'fastify'
import { EventRouter, Request } from '@esliph/http'
import { Adapter, AdapterLoadEventOptions } from '@esliph/module/dist/adapter'
import { METADATA_ADAPTER_FASTIFY_HTTP_ROUTER_HANDLER_KEY } from './global'

export class FastifyAdapter implements Adapter<FastifyInstance> {
    // @ts-expect-error
    static instance: FastifyInstance = null

    adapterKey = METADATA_ADAPTER_FASTIFY_HTTP_ROUTER_HANDLER_KEY

    loadEvent({ handlers, event, method, statusCode }: AdapterLoadEventOptions) {
        // @ts-expect-error
        this.instance[method](event, async (req: FastifyRequest, res: FastifyReply) => {
            const request = new Request({
                headers: req.headers,
                body: req.body,
                params: { ...req.query as any, ...req.params as any },
                method: req.method as any,
                name: req.routeOptions.url,
                attributes: {
                    ...req,
                    body: undefined,
                    headers: undefined,
                    query: undefined,
                    method: undefined,
                    params: undefined,
                    routeOptions: { url: undefined },
                }
            })

            const eventRouter = new EventRouter(request, handlers || ([] as any), true)

            await eventRouter.perform()

            const result = eventRouter.response.getResponse()

            if (result.isSuccess()) {
                res.status(statusCode)
            } else {
                res.status(result.getStatus())
            }

            res.send({ ...result.getResponse(), status: statusCode })
        })
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