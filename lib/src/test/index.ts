import { Client } from '@esliph/http'
import { Injection } from '@esliph/injection'
import { Bootstrap, Controller, Get, Module, Service } from '../index'

@Service({ name: 'app.service' })
class AppService {
    hello() { return 'Hello World' }
}

@Controller()
class AppController {
    constructor(@Injection.Inject('app.service') private service: AppService) { }

    @Get('/hello')
    hello() { return this.service.hello() }
}

@Module({ providers: [AppService] })
class TestModule { }

@Module({
    imports: [TestModule],
    controllers: [AppController],
    providers: []
})
class AppModule { }

Bootstrap(AppModule, { logEventHttp: true, logEventListener: true, logLoad: true })

new Client().get('/hello').then(res => console.log(res))