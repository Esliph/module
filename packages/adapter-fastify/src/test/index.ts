import { Controller, Module, Bootstrap } from '@esliph/module'
import { Get, FastifyAdapter } from '../index'

@Controller()
class UserController {
    @Get('/hello')
    hello() {}
}

@Module({
    controllers: [UserController],
})
class UserModule {}

Bootstrap(UserModule, { log: { eventHttp: true, eventListener: true, load: true }, port: 8080 })
