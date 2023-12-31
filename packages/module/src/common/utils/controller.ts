import { METADATA_CONTROLLER_KEY } from '../../constants'
import { Metadata } from '@esliph/metadata'

export function isController(constructor: any) {
    return !!Metadata.Get.Class(METADATA_CONTROLLER_KEY, constructor)
}
