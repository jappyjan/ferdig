import {ApplicationCollectionColumnValueType} from '../ApplicationCollectionColumn';
import ApplicationCollectionDocument, {DocumentAsObjectType, DocumentAsObjectValueType} from '../ApplicationCollectionDocument';

export function documentToObject(document: ApplicationCollectionDocument): DocumentAsObjectType {
    // eslint-disable-next-line
    const obj: DocumentAsObjectType = {
        id: document.id,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
    };

    const parseValue = (value: string, valueType: ApplicationCollectionColumnValueType): DocumentAsObjectValueType => {
        switch (valueType) {
            case ApplicationCollectionColumnValueType.Date:
                return new Date(value);

            case ApplicationCollectionColumnValueType.Number:
                return Number(value);

            case ApplicationCollectionColumnValueType.String:
                return value;

            case ApplicationCollectionColumnValueType.Boolean:
                return Boolean(value);

            default:
                throw new Error(`unknown document column value type: ${valueType}`)
        }
    }

    document.properties.forEach((property) => {
        const parsedValue = parseValue(property.value, property.column.valueType);

        if (property.column.isArray) {
            if (!Array.isArray(obj[property.column.internalName])) {
                obj[property.column.internalName] = [];
            }

            (obj[property.column.internalName] as DocumentAsObjectValueType[]).push(parsedValue);
            return;
        }

        obj[property.column.internalName] = parsedValue;
    });

    return obj;
}
