import {MigrationInterface, QueryRunner} from "typeorm";

export class init1629402011880 implements MigrationInterface {
    name = 'init1629402011880'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "application_collection_document" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "collectionId" uuid NOT NULL, CONSTRAINT "PK_5da06251e4bae3dfb7d1c489446" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "application_collection_document_property" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "value" character varying NOT NULL, "documentId" uuid NOT NULL, "columnId" uuid NOT NULL, CONSTRAINT "PK_2928006db9427b5edb1e51e20bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "application_collection_document_access_rule_operator_enum" AS ENUM('EQUAL', 'LESS', 'LESS_OR_EQUAL', 'GREATER', 'GREATER_OR_EQUAL', 'NOT_EQUAL', 'TRUE', 'FALSE')`);
        await queryRunner.query(`CREATE TABLE "application_collection_document_access_rule" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "leftSide" character varying, "operator" "application_collection_document_access_rule_operator_enum", "rightSide" character varying, "parentAndRuleId" uuid, "parentOrRuleId" uuid, CONSTRAINT "PK_42a2bd9addae102942cc865edf6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "application_collection_column_valuetype_enum" AS ENUM('string', 'number', 'date', 'boolean', 'file')`);
        await queryRunner.query(`CREATE TABLE "application_collection_column" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "internalName" character varying NOT NULL, "valueType" "application_collection_column_valuetype_enum" NOT NULL, "isArray" boolean NOT NULL, "writeAccessRuleId" uuid, "readAccessRuleId" uuid, "collectionId" uuid NOT NULL, CONSTRAINT "UQ_e0586a6c698d78f661d6e5d6293" UNIQUE ("internalName", "collectionId"), CONSTRAINT "REL_eb2d8f9f5d6d077e4f6d8eb6b7" UNIQUE ("writeAccessRuleId"), CONSTRAINT "REL_047ed2694feed690cad641d452" UNIQUE ("readAccessRuleId"), CONSTRAINT "PK_77179e5427215f20ada2f0c4d11" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "application_collection" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "internalName" character varying NOT NULL, "readAccessRuleId" uuid, "writeAccessRuleId" uuid, "applicationId" uuid NOT NULL, CONSTRAINT "UQ_c8003422fa7436b0dab14cc5a3c" UNIQUE ("internalName", "applicationId"), CONSTRAINT "REL_225775b9154f5c001c202a04ec" UNIQUE ("readAccessRuleId"), CONSTRAINT "REL_406f3d8a7b980d3a676dc4b536" UNIQUE ("writeAccessRuleId"), CONSTRAINT "PK_57a67fc608b8d5a6edff588aee0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "application_automation_flow_node_config_value" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "key" character varying NOT NULL, "value" character varying NOT NULL, "nodeId" uuid NOT NULL, CONSTRAINT "PK_e97bff4f9bc2630ca7e0e10df53" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "application_automation_flow_node_log_level_enum" AS ENUM('info', 'error')`);
        await queryRunner.query(`CREATE TABLE "application_automation_flow_node_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "level" "application_automation_flow_node_log_level_enum" NOT NULL, "message" character varying NOT NULL, "receivedPayload" character varying NOT NULL, "nodeId" uuid NOT NULL, CONSTRAINT "PK_2e9579bc9a2b64cc070f7b698d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "application_automation_flow_node_type_enum" AS ENUM('user::created', 'auth::login', 'notification_template::load', 'notifications::send', 'automation::change_payload', 'automation::map_payload')`);
        await queryRunner.query(`CREATE TABLE "application_automation_flow_node" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "parentId" uuid, "type" "application_automation_flow_node_type_enum" NOT NULL, "automationId" uuid NOT NULL, CONSTRAINT "PK_968dea52ed1724117c7821d5ec2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "application_automation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "internalName" character varying NOT NULL, "applicationId" uuid NOT NULL, CONSTRAINT "UQ_58aea5a06e75cf313f9e1a5ed9a" UNIQUE ("internalName", "applicationId"), CONSTRAINT "PK_24048c52709918b8dba14d75a9c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "application_notification_template" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "internalName" character varying NOT NULL, "subject" character varying NOT NULL, "body" character varying NOT NULL, "applicationId" uuid NOT NULL, CONSTRAINT "UQ_7deec87a68b789ecd72d583954e" UNIQUE ("internalName", "applicationId"), CONSTRAINT "PK_4d4381f04a00a2293dfe1ad5f33" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "application_configuration" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "loginRequiresValidEmail" boolean NOT NULL DEFAULT true, "emailHost" character varying NOT NULL, "emailPort" integer NOT NULL, "emailSsl" boolean NOT NULL, "emailAuthuser" character varying NOT NULL, "emailAuthpassword" character varying NOT NULL, "emailFromname" character varying NOT NULL, "emailFromaddress" character varying NOT NULL, CONSTRAINT "PK_a8569665cdeb96fecef40403267" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "application" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "internalName" character varying NOT NULL, "configurationId" uuid NOT NULL, CONSTRAINT "UQ_03d3b5324680210610019109ddf" UNIQUE ("internalName"), CONSTRAINT "REL_66f134215ba8346e66dd4a7496" UNIQUE ("configurationId"), CONSTRAINT "PK_569e0c3e863ebdf5f2408ee1670" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_notification_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "wantsPushNotifications" boolean NOT NULL DEFAULT false, "userId" uuid NOT NULL, CONSTRAINT "REL_984f3e1d8fe9c03831b20b8d7a" UNIQUE ("userId"), CONSTRAINT "PK_a195de67d093e096152f387afbd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_auth" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "passwordHash" character varying NOT NULL, "emailVerified" boolean NOT NULL DEFAULT false, "hasConsoleAccess" boolean NOT NULL DEFAULT false, "isDisabled" boolean NOT NULL DEFAULT false, "emailValidationToken" character varying, "userId" uuid NOT NULL, CONSTRAINT "REL_52403f2133a7b1851d8ab4dc9d" UNIQUE ("userId"), CONSTRAINT "PK_56d00ec31dc3eed1c3f6bff4f58" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying NOT NULL, "applicationId" uuid, CONSTRAINT "UQ_cc36f6f12e16d9349f2458d57bc" UNIQUE ("email", "applicationId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "application_collection_document" ADD CONSTRAINT "FK_d64b634d4911f3b24afbdb3d6c4" FOREIGN KEY ("collectionId") REFERENCES "application_collection"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_collection_document_property" ADD CONSTRAINT "FK_98cd388cf70893bd15d98c672e7" FOREIGN KEY ("documentId") REFERENCES "application_collection_document"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_collection_document_property" ADD CONSTRAINT "FK_f1365b19a2c505d87597c03f8b1" FOREIGN KEY ("columnId") REFERENCES "application_collection_column"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_collection_document_access_rule" ADD CONSTRAINT "FK_2d3a8dcce5bd73006dd78258560" FOREIGN KEY ("parentAndRuleId") REFERENCES "application_collection_document_access_rule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_collection_document_access_rule" ADD CONSTRAINT "FK_9c0cffabce9fa8bc632a24f62ce" FOREIGN KEY ("parentOrRuleId") REFERENCES "application_collection_document_access_rule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_collection_column" ADD CONSTRAINT "FK_eb2d8f9f5d6d077e4f6d8eb6b73" FOREIGN KEY ("writeAccessRuleId") REFERENCES "application_collection_document_access_rule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_collection_column" ADD CONSTRAINT "FK_047ed2694feed690cad641d4525" FOREIGN KEY ("readAccessRuleId") REFERENCES "application_collection_document_access_rule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_collection_column" ADD CONSTRAINT "FK_0ee75e8e85d5b6ec6cf88b8bc7b" FOREIGN KEY ("collectionId") REFERENCES "application_collection"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_collection" ADD CONSTRAINT "FK_225775b9154f5c001c202a04eca" FOREIGN KEY ("readAccessRuleId") REFERENCES "application_collection_document_access_rule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_collection" ADD CONSTRAINT "FK_406f3d8a7b980d3a676dc4b5361" FOREIGN KEY ("writeAccessRuleId") REFERENCES "application_collection_document_access_rule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_collection" ADD CONSTRAINT "FK_ea1fc8182bf5d91e0713169ad73" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_automation_flow_node_config_value" ADD CONSTRAINT "FK_982a9736eeed31dd8997ea81384" FOREIGN KEY ("nodeId") REFERENCES "application_automation_flow_node"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_automation_flow_node_log" ADD CONSTRAINT "FK_10d6a83a633cf7b495e300b10fa" FOREIGN KEY ("nodeId") REFERENCES "application_automation_flow_node"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_automation_flow_node" ADD CONSTRAINT "FK_814716f2c15def13df87ca67673" FOREIGN KEY ("automationId") REFERENCES "application_automation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_automation_flow_node" ADD CONSTRAINT "FK_428ef99eb42ffecc30d201b9e37" FOREIGN KEY ("parentId") REFERENCES "application_automation_flow_node"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_automation" ADD CONSTRAINT "FK_9c4076d6d0ead8a139a85b33495" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_notification_template" ADD CONSTRAINT "FK_c48a6cee81321044c150b603ded" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application" ADD CONSTRAINT "FK_66f134215ba8346e66dd4a74969" FOREIGN KEY ("configurationId") REFERENCES "application_configuration"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_notification_settings" ADD CONSTRAINT "FK_984f3e1d8fe9c03831b20b8d7a4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_auth" ADD CONSTRAINT "FK_52403f2133a7b1851d8ab4dc9db" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_8eb0871eb31b4f559100a6e01a6" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE TABLE "query-result-cache" ("id" SERIAL NOT NULL, "identifier" character varying, "time" bigint NOT NULL, "duration" integer NOT NULL, "query" text NOT NULL, "result" text NOT NULL, CONSTRAINT "PK_6a98f758d8bfd010e7e10ffd3d3" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "query-result-cache"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_8eb0871eb31b4f559100a6e01a6"`);
        await queryRunner.query(`ALTER TABLE "user_auth" DROP CONSTRAINT "FK_52403f2133a7b1851d8ab4dc9db"`);
        await queryRunner.query(`ALTER TABLE "user_notification_settings" DROP CONSTRAINT "FK_984f3e1d8fe9c03831b20b8d7a4"`);
        await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_66f134215ba8346e66dd4a74969"`);
        await queryRunner.query(`ALTER TABLE "application_notification_template" DROP CONSTRAINT "FK_c48a6cee81321044c150b603ded"`);
        await queryRunner.query(`ALTER TABLE "application_automation" DROP CONSTRAINT "FK_9c4076d6d0ead8a139a85b33495"`);
        await queryRunner.query(`ALTER TABLE "application_automation_flow_node" DROP CONSTRAINT "FK_428ef99eb42ffecc30d201b9e37"`);
        await queryRunner.query(`ALTER TABLE "application_automation_flow_node" DROP CONSTRAINT "FK_814716f2c15def13df87ca67673"`);
        await queryRunner.query(`ALTER TABLE "application_automation_flow_node_log" DROP CONSTRAINT "FK_10d6a83a633cf7b495e300b10fa"`);
        await queryRunner.query(`ALTER TABLE "application_automation_flow_node_config_value" DROP CONSTRAINT "FK_982a9736eeed31dd8997ea81384"`);
        await queryRunner.query(`ALTER TABLE "application_collection" DROP CONSTRAINT "FK_ea1fc8182bf5d91e0713169ad73"`);
        await queryRunner.query(`ALTER TABLE "application_collection" DROP CONSTRAINT "FK_406f3d8a7b980d3a676dc4b5361"`);
        await queryRunner.query(`ALTER TABLE "application_collection" DROP CONSTRAINT "FK_225775b9154f5c001c202a04eca"`);
        await queryRunner.query(`ALTER TABLE "application_collection_column" DROP CONSTRAINT "FK_0ee75e8e85d5b6ec6cf88b8bc7b"`);
        await queryRunner.query(`ALTER TABLE "application_collection_column" DROP CONSTRAINT "FK_047ed2694feed690cad641d4525"`);
        await queryRunner.query(`ALTER TABLE "application_collection_column" DROP CONSTRAINT "FK_eb2d8f9f5d6d077e4f6d8eb6b73"`);
        await queryRunner.query(`ALTER TABLE "application_collection_document_access_rule" DROP CONSTRAINT "FK_9c0cffabce9fa8bc632a24f62ce"`);
        await queryRunner.query(`ALTER TABLE "application_collection_document_access_rule" DROP CONSTRAINT "FK_2d3a8dcce5bd73006dd78258560"`);
        await queryRunner.query(`ALTER TABLE "application_collection_document_property" DROP CONSTRAINT "FK_f1365b19a2c505d87597c03f8b1"`);
        await queryRunner.query(`ALTER TABLE "application_collection_document_property" DROP CONSTRAINT "FK_98cd388cf70893bd15d98c672e7"`);
        await queryRunner.query(`ALTER TABLE "application_collection_document" DROP CONSTRAINT "FK_d64b634d4911f3b24afbdb3d6c4"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "user_auth"`);
        await queryRunner.query(`DROP TABLE "user_notification_settings"`);
        await queryRunner.query(`DROP TABLE "application"`);
        await queryRunner.query(`DROP TABLE "application_configuration"`);
        await queryRunner.query(`DROP TABLE "application_notification_template"`);
        await queryRunner.query(`DROP TABLE "application_automation"`);
        await queryRunner.query(`DROP TABLE "application_automation_flow_node"`);
        await queryRunner.query(`DROP TYPE "application_automation_flow_node_type_enum"`);
        await queryRunner.query(`DROP TABLE "application_automation_flow_node_log"`);
        await queryRunner.query(`DROP TYPE "application_automation_flow_node_log_level_enum"`);
        await queryRunner.query(`DROP TABLE "application_automation_flow_node_config_value"`);
        await queryRunner.query(`DROP TABLE "application_collection"`);
        await queryRunner.query(`DROP TABLE "application_collection_column"`);
        await queryRunner.query(`DROP TYPE "application_collection_column_valuetype_enum"`);
        await queryRunner.query(`DROP TABLE "application_collection_document_access_rule"`);
        await queryRunner.query(`DROP TYPE "application_collection_document_access_rule_operator_enum"`);
        await queryRunner.query(`DROP TABLE "application_collection_document_property"`);
        await queryRunner.query(`DROP TABLE "application_collection_document"`);
    }

}
