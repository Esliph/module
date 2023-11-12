import { ObserverEmitter, ObserverListener } from '@esliph/observer'
import { Service } from '@common/module/decorator'

@Service({ name: 'observer.emitter' })
export class Emitter extends ObserverEmitter {
    constructor() {
        super({})
    }
}

@Service({ name: 'observer.listener' })
export class Listener extends ObserverListener {
    constructor() {
        super({})
    }
}
