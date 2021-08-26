import {PlatformTest} from '@tsed/common';
import SuperTest from 'supertest';
import {Server} from '../Server';

describe('Server', () => {
    let request: SuperTest.SuperTest<SuperTest.Test>;

    beforeEach(PlatformTest.bootstrap(Server));
    beforeEach(() => {
        request = SuperTest(PlatformTest.callback());
    });

    afterEach(PlatformTest.reset);

    it('should return server health GET /api/health', async () => {
        await request.get('/api/health')
            .expect(200, 'healthy');
    });
});
