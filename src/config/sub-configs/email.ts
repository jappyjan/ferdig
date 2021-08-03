import {TransportOptions} from 'nodemailer';
import {Options as SMTPTransportOptions} from 'nodemailer/lib/smtp-transport';
import {getEnvVar} from '../../utils/env';

const authUser = getEnvVar('EMAIL_TRANSPORT_AUTH_USER', 'string');
const authPass = getEnvVar('EMAIL_TRANSPORT_AUTH_PASS', 'string');

let auth: undefined | { user: string, pass: string } = undefined;
if (authUser && authPass) {
    auth = {
        user: authUser,
        pass: authPass,
    };
}

export const emailConfig: TransportOptions & SMTPTransportOptions = {
    host: getEnvVar('EMAIL_TRANSPORT_HOST', 'string'),
    port: getEnvVar('EMAIL_TRANSPORT_PORT', 'number'),
    secure: getEnvVar('EMAIL_TRANSPORT_SECURE', 'boolean'),
    auth,
    from: {
        name: getEnvVar('EMAIL_TRANSPORT_FROM_NAME', 'string'),
        address: getEnvVar('EMAIL_TRANSPORT_FROM_ADDRESS', 'string'),
    },
};
