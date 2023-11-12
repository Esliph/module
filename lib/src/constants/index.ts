// # Global Config
export const KEY_SECRET_SERVER = 'ksnfijubd g fgifbijbgi dfjg odfn goindfoi gndoifngiodfnhgiudf d'
export const EXPIRE_TOKEN_JWT = 60 * 60 * 24 // 24h in seconds

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
export const METADATA_HTTP_ROUTER_HANDLER_KEY = 'http.router.event'

// # Guard
export const GUARD_AUTHORIZATION = 'authorization'
