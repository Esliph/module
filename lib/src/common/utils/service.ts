import { Metadata } from '@esliph/metadata'
import { METADATA_SERVICE_KEY } from '../../constants/index'

export function isService(constructor: any) {
    return !!Metadata.Get.Class(METADATA_SERVICE_KEY, constructor)
}
