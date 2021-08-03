import User from '../../entity/Users/User';
import {Type} from '@tsed/core';
import {ProtocolOptions} from '@tsed/passport/lib/interfaces/ProtocolOptions';

type passportConfigType = {
    userProperty?: string;
    pauseStream?: string;
    userInfoModel?: Type<unknown>;
    protocols?: {
        [protocolName: string]: Partial<ProtocolOptions>;
    };
};

export const passportConfig: passportConfigType = {
    userInfoModel: User,
}
