import {getEnvVar} from '../../utils/env';

export const emailConfig = {
    useMailcatcher: getEnvVar('EMAIL_USE_MAILCATCHER', 'boolean', false),
    debug: getEnvVar('EMAIL_DEBUG', 'boolean', false),
}
