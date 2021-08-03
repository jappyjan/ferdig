import {ListResult} from '../services/shared-types/ListResult';

export interface CrudController<DocumentType> {
    create(...args: unknown[]): Promise<DocumentType>;
    update(...args: unknown[]): Promise<DocumentType>;
    getOne(...args: unknown[]): Promise<DocumentType>;
    list(...args: unknown[]): Promise<ListResult<DocumentType>>;
    remove(...args: unknown[]): Promise<'success'>;
}
