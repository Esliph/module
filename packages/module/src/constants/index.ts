// # Metadata
export const METADATA_MODULE_KEY = 'class.modulated'
export const METADATA_CONTROLLER_KEY = 'class.controller'
export const METADATA_SERVICE_KEY = 'class.service'
export const METADATA_FILTER_KEY = 'class.filter'
export const METADATA_GUARD_KEY = 'method.guard'

export const METADATA_MODULE_CONFIG_KEY = `${METADATA_MODULE_KEY}.options`
export const METADATA_CONTROLLER_CONFIG_KEY = `${METADATA_CONTROLLER_KEY}.options`
export const METADATA_SERVICE_CONFIG_KEY = `${METADATA_SERVICE_KEY}.options`
export const METADATA_GUARD_CONFIG_KEY = `${METADATA_GUARD_KEY}.options`
export const METADATA_FILTER_CONFIG_KEY = `${METADATA_FILTER_KEY}.options`

export const METADATA_EVENT_HANDLER_KEY = 'listener.handler.event'
export const METADATA_EVENT_CONFIG_KEY = `${METADATA_EVENT_HANDLER_KEY}.options`
export const METADATA_EVENT_CONFIG_KEY_STATUS_CODE = `${METADATA_EVENT_CONFIG_KEY}.status-code`
export const METADATA_HTTP_ROUTER_HANDLER_KEY = 'http.router.event'
export const METADATA_ADAPTER_KEY = 'adapter'
export const METADATA_ADAPTER_LOCAL_ROUTER_HANDLER_KEY = `local.${METADATA_ADAPTER_KEY}.http.router.event`
