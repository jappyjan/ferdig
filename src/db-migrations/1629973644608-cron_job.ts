import {MigrationInterface, QueryRunner} from "typeorm";

export class cronJob1629973644608 implements MigrationInterface {
    name = 'cronJob1629973644608'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cron_job" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "jobId" character varying NOT NULL, "interval" integer, "nextRun" TIMESTAMP NOT NULL, "payload" character varying, "lockedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_3f180d097e1216411578b642513" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "cron_job"`);
    }

}
