import { Console } from '@esliph/console'
import { Client } from '@esliph/http'
import { Injection } from '@esliph/injection'
import { Bootstrap, Controller, Get, Module, Service } from '../index'

@Service({ name: 'app.service' })
class AppService {
    hello() {
        return 'Hello World'
    }
}

@Controller()
class AppController {
    constructor(@Injection.Inject('app.service') private service: AppService, @Injection.Inject('global.service.logger') private logger: Console) { }

    @Get('/hello')
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
    providers: [],
})
class AppModule { }

@Service({ name: 'logger' })
class Consol extends Console { }

const application = Bootstrap(AppModule, { log: { load: true, eventHttp: true, eventListener: true } })

new Client().get('/hello').then(res => console.log(res))
