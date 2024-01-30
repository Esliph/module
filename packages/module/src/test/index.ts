import { Console } from '@esliph/console'
import { Client, HttpStatusCodes, Request, Response } from '@esliph/http'
import { Injection } from '@esliph/injection'
import { Bootstrap, Controller, Filter, FilterPerform, Get, Guard, HttpStatusCode, Module, Service } from '../index'
import { OnEvent } from '../common/event/decorator'
import { ObserverEmitter } from '@esliph/observer'

@Service({ name: 'app.service' })
class AppService {
    static onLoad() {
        console.log('Loading APP SERVICE')
    }

    static onStart() {
        console.log('Loading APP SERVICE')
    }

    hello() {
        return 'Hello World'
    }
}

@Filter({ name: 'authorization' })
class AuthorizationFilter implements FilterPerform {
    async perform(req: Request<any>, res: Response<any>) {
        console.log('!')
    }
}

@Filter({ name: 'authorization2' })
class AuthorizationFilter2 implements FilterPerform {
    async perform(req: Request<any>, res: Response<any>) {
        console.log('!!')
    }
}

@Controller({ prefix: '/hello' })
class AppController {
    constructor(@Injection.Inject('app.service') private service: AppService, @Injection.Inject('global.service.logger') private logger: Console) { }

    @Guard({ name: 'auth' })
    @Guard({ name: 'auth2' })
    @Get('/world')
    @HttpStatusCode(HttpStatusCodes.ACCEPTED)
    hello() {
        this.logger.error('Teste')

        return this.service.hello()
    }

    @Get('/world', { prefix: '/admin' })
    adminHello() {
        this.logger.error('Admin Teste')

        return this.service.hello()
    }

    @OnEvent('/hello')
    teste(data: any) {
        console.log(data)
    }
}

@Module({ providers: [AppService] })
class TestModule { }

@Module({
    imports: [TestModule],
    controllers: [AppController],
    providers: [
        AuthorizationFilter,
        AuthorizationFilter2,
        { whenCall: 'auth', use: 'authorization' },
        { whenCall: 'auth2', use: 'authorization2' }
    ],
})
class AppModule { }

Bootstrap(AppModule, { log: { load: true } })

const client = new Client()
const emitter = new ObserverEmitter()

async function App() {
    await client.get('/hello/world')
    await client.get('/admin/world')

    emitter.emit('/hello', { hello: true })
}

App()