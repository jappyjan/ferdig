import {app} from '@/main';

export function errorMessage(error: Error | string): Promise<void> {
    let text = error as string;
    if (error instanceof Error) {
        text = error.message;
    }

    return app.$dialog.error({
        title: 'Oops! Something bad happened',
        text,
    });
}
