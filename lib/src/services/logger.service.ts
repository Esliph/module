import { Console } from '@esliph/console'
import { Service } from '../common/module'

const TEMPLATE_LOG = '<prefix?value="#"&styles=italic> <dateTime>  <method?background=blue>  <context?color=green&styles=bold>: <message>'
const TEMPLATE_ERROR = '<prefix?value="#"&styles=italic> <dateTime>  <method?background=red>  <context?color=green&styles=bold>: <message>'
const TEMPLATE_WARN = '<prefix?value="#"&styles=italic> <dateTime>  <method?background=yellow&color=black>  <context?color=green&styles=bold>: <message>'
const TEMPLATE_INFO = '<prefix?value="#"&styles=italic> <dateTime>  <method?background=white>  <context?color=green&styles=bold>: <message>'

@Service({ name: 'logger' })
export class Logger extends Console<typeof TEMPLATE_LOG, typeof TEMPLATE_ERROR, typeof TEMPLATE_WARN, typeof TEMPLATE_INFO> {
    constructor(args: { context?: string } = {}) {
        super({
            methodsValue: { context: args.context ? `[${args.context}]` : '' }, templates: {
                log: TEMPLATE_LOG,
                error: TEMPLATE_ERROR,
                warn: TEMPLATE_WARN,
                info: TEMPLATE_INFO,
            }
        })
    }
}
