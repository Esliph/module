import { Controller, Module, Bootstrap, Filter, FilterPerform, Guard } from '@esliph/module'
import { AdapterSocketIO, OnClient, SocketIO } from '../index'
import { Request, Response } from '@esliph/http'

@Filter({ name: 'guard.test' })
class FilterTest implements FilterPerform {
    async perform(req: Request<any>, res: Response<any>) {
        // throw new ResultException({ message: 'Erro de Teste' })
    }
}
@Controller()
class UserController {
    @Guard({ name: 'guard.test' })
    @OnClient('/hello')
    hello() {
        return { hello: 'world' }
    }
}

@Module({
    controllers: [UserController],
    providers: [FilterTest],
})
class UserModule {}

AdapterSocketIO.loadInstance(new SocketIO.Server())

const app = Bootstrap(UserModule, { log: { eventHttp: true, eventListener: true, load: true } }, [new AdapterSocketIO()])

AdapterSocketIO.instance.listen(8080, {})

app.logger.log(`IO listen in port ${8080}`)
