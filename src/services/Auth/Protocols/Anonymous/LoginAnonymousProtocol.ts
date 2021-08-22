import {OnVerify, Protocol} from '@tsed/passport';
import {Strategy} from 'passport-anonymous';
import {Constant} from '@tsed/common';

@Protocol({
    name: 'anonymous',
    useStrategy: Strategy,
})
export class LoginAnonymousProtocol implements OnVerify {
    @Constant('passport.protocols.jwt.settings')
    jwtSettings: {
        issuer?: string,
        audience?: string,
        secretOrKey: string,
        maxAge?: number
    };

    public $onVerify(...args: any[]): void {
        // FACADE
        // not called from strategy, actual jwt generation sadly has to happen in auth controller
    }
}
