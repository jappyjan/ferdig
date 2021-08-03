import {ListPayload} from '../../../services/Applications/ListPayload';
import ListPaginationModel from '../../shared-models/ListPaginationModel';

export default class ApplicationsListPayloadModel implements ListPayload {
    pagination: ListPaginationModel | null;
}
