import {MigrationInterface, QueryRunner} from "typeorm";

export class emailConfigClientType1630333922224 implements MigrationInterface {
    name = 'emailConfigClientType1630333922224'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "application_configuration_emailclienttype_enum" AS ENUM('aws_ses', 'nodemailer')`);
        await queryRunner.query(`ALTER TABLE "application_configuration" ADD "emailClienttype" "application_configuration_emailclienttype_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "application_configuration" ADD "emailReplytoname" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "application_configuration" ADD "emailReplytoaddress" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application_configuration" DROP COLUMN "emailReplytoaddress"`);
        await queryRunner.query(`ALTER TABLE "application_configuration" DROP COLUMN "emailReplytoname"`);
        await queryRunner.query(`ALTER TABLE "application_configuration" DROP COLUMN "emailClienttype"`);
        await queryRunner.query(`DROP TYPE "application_configuration_emailclienttype_enum"`);
    }

}
