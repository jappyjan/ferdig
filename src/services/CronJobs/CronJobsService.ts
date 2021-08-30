import {Inject, OnInit, Service} from '@tsed/di';
import {DEFAULT_DB_CONNECTION} from '../providers/defaultDBConnection';
import {runInTransaction, waitForAllPromises} from '../../utils/typeorm.utils';
import {Brackets, QueryRunner} from 'typeorm';
import CronJob from '../../entity/CronJobs/CronJob';
import {makeLogger} from '../../utils/logger';
import {Logger} from '@tsed/logger';

type JobId = string;
type JobExecutor = (job: CronJob) => Promise<unknown>;
type JobExecutorList = Record<JobId, JobExecutor[] | undefined>;

interface JobOptions {
    jobId: string;
    interval: number | null;
    runAt: Date;
    payload?: string;
}

@Service()
export default class CronJobsService implements OnInit {
    private orm: DEFAULT_DB_CONNECTION;
    private readonly JOB_QUEUE_INTERVALL = 1000 * 60;
    private readonly JOB_THRESHOLD = 10;
    private jobExecutors: JobExecutorList = {};
    private readonly $log: Logger;

    public constructor(@Inject(DEFAULT_DB_CONNECTION) orm: DEFAULT_DB_CONNECTION) {
        this.orm = orm;
        this.$log = makeLogger('Cron-Jobs');
    }

    public $onInit() {
        setInterval(() => this.executeJobQueue(), this.JOB_QUEUE_INTERVALL);
    }

    public registerCronJob(jobId: JobId, executor: JobExecutor) {
        this.$log.info('Registering Job-Handler:', jobId);
        if (!this.jobExecutors[jobId]) {
            this.jobExecutors[jobId] = [];
        }

        this.jobExecutors[jobId]!.push(executor);
    }

    public async scheduleJob(options: JobOptions, skipIfExists = false) {
        this.$log.info('Scheduling Job:', JSON.stringify(options));

        const existing = await this.orm.manager.getRepository(CronJob)
            .findOne({
                jobId: options.jobId,
            });

        if (existing && skipIfExists) {
            return;
        }

        if (!existing) {
            return await this.orm.manager.getRepository(CronJob).save({
                jobId: options.jobId,
                interval: options.interval,
                nextRun: options.runAt,
                payload: options.payload,
            });
        }

        const updateData = {
            interval: options.interval,
            nextRun: options.runAt,
            payload: options.payload,
        }
        await this.orm.manager.getRepository(CronJob).update(
            existing.id,
            updateData,
        );

        Object.assign(existing, updateData);
        return existing;
    }

    private async executeJobQueue() {
        const runner = this.orm.createQueryRunner();

        const jobs = await runInTransaction(
            'CronJobsService',
            {runner, isInjectedRunner: false},
            ({runner: runnerInTransaction}) => {
                return this.getAndLockJobs(runnerInTransaction);
            },
        );

        if (!jobs) {
            return;
        }

        await waitForAllPromises(jobs.map(this.executeJob.bind(this)));
    }

    // noinspection JSMethodCanBeStatic
    private async getAndLockJobs(runner: QueryRunner): Promise<CronJob[]> {
        const unlockTime = new Date();
        unlockTime.setMinutes(unlockTime.getMinutes() - 10);

        const now = new Date();

        const jobs = await runner.manager.getRepository(CronJob)
            .createQueryBuilder('job')
            .orderBy('job.nextRun', 'ASC')
            .where(new Brackets((lockQb) => {
                lockQb.where('job.lockedAt IS NULL')
                    .orWhere('job.lockedAt < :unlockTime');
            }))
            .andWhere('job.nextRun <= :now')
            .setParameters({
                unlockTime,
                now,
            })
            .limit(this.JOB_THRESHOLD)
            .getMany();

        const lockOneJob = async (job: CronJob) => {
            await runner.manager.getRepository(CronJob)
                .update(job, {
                    lockedAt: new Date(),
                });
        }

        await waitForAllPromises(jobs.map(lockOneJob));

        return jobs;
    }

    private async executeJob(job: CronJob) {
        const {jobId, interval} = job;

        this.$log.info('Executing Job:', jobId);

        const executors = this.jobExecutors[jobId] ?? [];
        await waitForAllPromises(executors.map((executor) => executor(job)));

        if (interval) {
            const nextRun = new Date();
            nextRun.setSeconds(nextRun.getSeconds() + interval);
            await this.orm.manager.getRepository(CronJob).update(job, {
                nextRun,
                lockedAt: null,
            });
        } else {
            await this.orm.manager.getRepository(CronJob).remove(job);
        }
    }
}
