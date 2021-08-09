import {DocumentAsObjectValueType} from '../../../../entity/Applications/Collections/ApplicationCollectionDocument';
import {MinioFile} from '../../../shared-providers/defaultMinioConnection';

export type DocumentCreateAndUpdateData = Record<string, DocumentAsObjectValueType | MinioFile | Array<DocumentAsObjectValueType | MinioFile>>;
