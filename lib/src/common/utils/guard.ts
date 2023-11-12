import { Metadata } from '@esliph/metadata'
import { METADATA_GUARD_KEY } from '@constants/index'

export function isGuard(constructor: any, methodName: string) {
    return !!Metadata.Get.Method(METADATA_GUARD_KEY, constructor, methodName)
}
