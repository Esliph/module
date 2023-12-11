import { Controller, Module, Bootstrap, Filter, FilterPerform, Guard } from '@esliph/module'
import { Get, FastifyAdapter } from '../index'
import { Request, Response } from '@esliph/http'
import Fastify from 'fastify'

@Filter({ name: 'guard.test' })
class FilterTest implements FilterPerform {
    async perform(req: Request<any>, res: Response<any>) {
        // throw new ResultException({ message: 'Erro de Teste' })
    }
}
@Controller()
class UserController {
    @Guard({ name: 'guard.test' })
    @Get('/hello/:id')
    hello() {
        return { hello: 'world' }
    }
}

@Module({
    controllers: [UserController],
    providers: [FilterTest],
})
class UserModule {}

FastifyAdapter.loadInstance(Fastify())

const app = Bootstrap(UserModule, { log: { eventHttp: true, eventListener: true, load: true } }, [new FastifyAdapter()])

FastifyAdapter.instance.listen({port: 8080}, () => {
    app.logger.log(`Server listen in port ${8080}`)
})
