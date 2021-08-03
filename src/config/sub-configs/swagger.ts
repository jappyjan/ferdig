import {SwaggerSettings} from '@tsed/swagger';

export const swaggerConfig: SwaggerSettings[] = [
    {
        path: '/api-docs/v1',
        specVersion: '3.0.1',
        spec: {
            info: {
                title: 'Ferdig API',
                version: require('../../../package.json').version,
            },
            components: {
                securitySchemes: {
                    bearer: {
                        description:
                            'Authenticate via a JWT token to access restricted resources',
                        type: 'apiKey',
                        name: 'authorization',
                        in: 'header',
                    },
                },
            },
        },
    },
];
