import { Metadata } from '@esliph/metadata'
import { METADATA_MODULE_KEY } from '../../constants/index'

export function isModule(constructor: any) {
    return !!Metadata.Get.Class(METADATA_MODULE_KEY, constructor)
}
