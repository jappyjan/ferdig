import {AgendaConfig} from 'agenda';
import {getEnvVar} from '../../utils/env';

export const agendaConfig: AgendaConfig & { enabled: boolean } = {
    enabled: true,
    db: {
        address: getEnvVar('AGENDA_MONGO_CONNECTION_STRING', 'string'),
        collection: 'agenda'
    },
};
