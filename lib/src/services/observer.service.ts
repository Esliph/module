import { ObserverEmitter, ObserverListener } from '@esliph/observer'
import { Service } from '../common/module'

@Service({ name: 'global.observer.emitter' })
export class Emitter extends ObserverEmitter {
    constructor() {
        super({})
    }
}

@Service({ name: 'global.observer.listener' })
export class Listener extends ObserverListener {
    constructor() {
        super({})
    }
}
