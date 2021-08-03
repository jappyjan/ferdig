import {FerdigApplication} from '@ferdig/client-js';
import {CrudState} from '@/store/module-templates/CrudState';

export class State extends CrudState<FerdigApplication> {
    activeApplication: FerdigApplication | null = null;
}
