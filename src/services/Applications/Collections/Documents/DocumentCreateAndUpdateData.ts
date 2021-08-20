import {DocumentAsObjectValueType} from '../../../../entity/Applications/Collections/ApplicationCollectionDocument';
import {FileUpload} from './ApplicationCollectionDocumentsService';

export type DocumentCreateAndUpdateData = Record<string, DocumentAsObjectValueType | FileUpload | Array<DocumentAsObjectValueType | FileUpload>>;
