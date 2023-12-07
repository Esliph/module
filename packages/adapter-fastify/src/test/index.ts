import { ResultException } from '@esliph/common'
import { Controller, Module, Bootstrap, Filter, FilterPerform, Guard } from '@esliph/module'
import { Get, FastifyAdapter } from '../index'
import { Request, Response } from '@esliph/http'

@Filter({ name: 'guard.test' })
class FilterTest implements FilterPerform {
    async perform(req: Request<any>, res: Response<any>) {
        throw new ResultException({ message: 'Erro de Teste' })
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
    providers: [FilterTest]
})
class UserModule { }

Bootstrap(UserModule, { log: { eventHttp: true, eventListener: true, load: true }, port: 8080, adapters: [new FastifyAdapter()] })
