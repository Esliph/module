import { Metadata } from '@esliph/metadata'
import { METADATA_FILTER_KEY } from '../../constants/index'

export function isFilter(constructor: any) {
    return !!Metadata.Get.Class(METADATA_FILTER_KEY, constructor)
}
