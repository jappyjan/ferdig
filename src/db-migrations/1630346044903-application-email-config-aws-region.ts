import {MigrationInterface, QueryRunner} from "typeorm";

export class applicationEmailConfigAwsRegion1630346044903 implements MigrationInterface {
    name = 'applicationEmailConfigAwsRegion1630346044903'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application_configuration" ADD "emailRegion" character varying`);
        await queryRunner.query(`ALTER TABLE "application_configuration" ALTER COLUMN "emailHost" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "application_configuration" ALTER COLUMN "emailPort" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "application_configuration" ALTER COLUMN "emailSsl" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "application_configuration" ALTER COLUMN "emailAuthuser" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "application_configuration" ALTER COLUMN "emailAuthpassword" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "application_configuration" ALTER COLUMN "emailFromname" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "application_configuration" ALTER COLUMN "emailReplytoname" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application_configuration" ALTER COLUMN "emailReplytoname" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "application_configuration" ALTER COLUMN "emailFromname" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "application_configuration" ALTER COLUMN "emailAuthpassword" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "application_configuration" ALTER COLUMN "emailAuthuser" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "application_configuration" ALTER COLUMN "emailSsl" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "application_configuration" ALTER COLUMN "emailPort" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "application_configuration" ALTER COLUMN "emailHost" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "application_configuration" DROP COLUMN "emailRegion"`);
    }

}
