import {getEnvVar} from '../../utils/env';

export const emailConfig = {
    debug: getEnvVar('EMAIL_DEBUG', 'boolean', false),
}
