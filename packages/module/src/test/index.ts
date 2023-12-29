import { Console } from '@esliph/console'
import { Client, Request, Response } from '@esliph/http'
import { Injection } from '@esliph/injection'
import { Bootstrap, Controller, Filter, FilterPerform, Get, Guard, Module, Service } from '../index'

@Service({ name: 'app.service' })
class AppService {
    static onLoad() {
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
    @Get('/world')
    hello() {
        this.logger.error('Teste')

        return this.service.hello()
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

new Client().get('/hello/world').then(res => { })
