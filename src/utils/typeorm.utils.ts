import {QueryRunner} from 'typeorm';
import {$log} from '@tsed/common';

export type OnCommitAction = () => Promise<unknown>;

interface CallbackArguments {
    runner: QueryRunner,
    onCommit: (action: OnCommitAction) => void,
}

interface Options {
    runner: QueryRunner;
    isInjectedRunner?: boolean;
}

export async function runInTransaction<T>(
    label: string,
    {runner, isInjectedRunner}: Options,
    cb: (args: CallbackArguments) => Promise<T>,
): Promise<T> {
    const timeout = setTimeout(async () => {
        await runner.rollbackTransaction();
        await runner.release();
        throw new Error(`!Transaction TIMEOUT: ${label}`);
    }, 120 * 60 * 1000);

    const actionsOnCommit: OnCommitAction[] = [];
    const onCommit = (action: OnCommitAction) => {
        actionsOnCommit.push(action);
    }

    try {
        $log.trace(`Transaction start: ${label}`);

        const response = await cb({runner, onCommit});

        $log.trace(`Transaction callback done: ${label}`);

        if (!isInjectedRunner) {
            $log.trace(`Transaction commit: ${label}`);
            await runner.commitTransaction();

            await waitForAllPromises(actionsOnCommit.map((action) => {
                return action();
            }));
        }

        return response;
    } catch (e) {
        if (!isInjectedRunner) {
            $log.error(`Transaction rollback: ${label}`);
            await runner.rollbackTransaction();
        }

        $log.error(`Transaction error: ${label}`);
        throw e;
    } finally {
        clearTimeout(timeout);
        $log.trace(`Transaction done: ${label}`);
        if (!isInjectedRunner) {
            $log.trace(`Transaction release: ${label}`);
            await runner.release();
        }
    }
}

interface PromiseResult<T> {
    data?: T,
    error: Error | null,
}

export async function waitForAllPromises<T>(promises: Array<Promise<T>>): Promise<T[]> {
    if (promises.length === 0) {
        return [];
    }

    const results: PromiseResult<T>[] = [];

    return new Promise((resolve, reject) => {
        const resolvePromise = () => {
            const error = results.find((r) => r.error !== null);
            if (error) {
                reject(error);
                return;
            }

            resolve(results.map((r) => r.data as T));
        }

        let promisesDone = 0;
        const runOnePromise = async (promise: Promise<T>, index: number): Promise<void> => {
            try {
                results[index] = {
                    error: null,
                    data: await promise,
                }
            } catch (e) {
                results[index] = {
                    error: e,
                };
            } finally {
                promisesDone++;

                if (promisesDone === promises.length) {
                    resolvePromise();
                }
            }
        }

        promises.forEach((promise, promiseIndex) => {
            runOnePromise(promise, promiseIndex);
        });
    });
}
