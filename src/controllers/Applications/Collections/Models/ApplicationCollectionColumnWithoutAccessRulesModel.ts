import ApplicationCollectionColumn, {ApplicationCollectionColumnValueType} from '../../../../entity/Applications/Collections/ApplicationCollectionColumn';
import {Enum, Format, JsonFormatTypes, Required} from '@tsed/schema';

export default class ApplicationCollectionColumnWithoutAccessRulesModel implements Partial<ApplicationCollectionColumn> {
    @Required()
    id: string;

    @Required()
    @Format(JsonFormatTypes.DATE_TIME)
    createdAt: Date;

    @Required()
    @Format(JsonFormatTypes.DATE_TIME)
    updatedAt: Date;

    @Required()
    internalName: string;

    @Required()
    isArray: boolean;

    @Required()
    @Enum(ApplicationCollectionColumnValueType)
    valueType: ApplicationCollectionColumnValueType;
}
