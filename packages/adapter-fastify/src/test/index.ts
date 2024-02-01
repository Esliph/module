import { Controller, Module, Bootstrap, Filter, FilterPerform, Guard, HttpStatusCode } from '@esliph/module'
import { Get, FastifyAdapter } from '../index'
import { HttpStatusCodes, Request, Response } from '@esliph/http'
import Fastify from 'fastify'

@Filter({ name: 'guard.test' })
class FilterTest implements FilterPerform {
    async perform(req: Request<any>, res: Response<any>) {
        // throw new ResultException({ message: 'Erro de Teste' })
    }
}
@Controller({ prefix: '/hello' })
class UserController {

    @Guard({ name: 'guard.test' })
    @Get('/hello/:id')
    hello(req: Request) {
        return { hello: 'world' }
    }

    @Guard({ name: 'guard.test' })
    @Get('/hello/:id', { prefix: '/admin' })
    @HttpStatusCode(HttpStatusCodes.ACCEPTED)
    adminHello(req: Request) {
        return { hello: 'world' }
    }
}

@Module({
    controllers: [UserController],
    providers: [FilterTest],
})
class UserModule { }

async function App() {
    FastifyAdapter.loadInstance(Fastify())

    const app = await Bootstrap(UserModule, { log: { eventHttp: true, eventListener: true, load: true } }, [new FastifyAdapter()])

    FastifyAdapter.instance.listen({ port: 3333 }, () => {
        app.logger.log(`Server listen in port ${3333}`)
    })
}

App()