import { Metadata } from '@esliph/metadata'
import { METADATA_HTTP_ROUTER_HANDLER_KEY, METADATA_EVENT_HANDLER_KEY } from '../../constants'
import { Construtor } from '../../@types'

export function isEventListener(classConstructor: Construtor, methodName: string) {
    return !!Metadata.Get.Method(METADATA_EVENT_HANDLER_KEY, classConstructor, methodName)
}

export function isEventHttp(classConstructor: Construtor, methodName: string) {
    return !!Metadata.Get.Method(METADATA_HTTP_ROUTER_HANDLER_KEY, classConstructor, methodName)
}
