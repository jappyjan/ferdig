import {MigrationInterface, QueryRunner} from "typeorm";

export class cronJobNullableLock1629974712357 implements MigrationInterface {
    name = 'cronJobNullableLock1629974712357'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cron_job" ALTER COLUMN "lockedAt" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cron_job" ALTER COLUMN "lockedAt" SET NOT NULL`);
    }

}
