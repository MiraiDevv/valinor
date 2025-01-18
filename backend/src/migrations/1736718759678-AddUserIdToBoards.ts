import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserIdToBoards1736718759678 implements MigrationInterface {
    name = 'AddUserIdToBoards1736718759678'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "boards" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "boards" ADD CONSTRAINT "FK_1ce74d5411749b559748b9f3276" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "boards" DROP CONSTRAINT "FK_1ce74d5411749b559748b9f3276"`);
        await queryRunner.query(`ALTER TABLE "boards" DROP COLUMN "userId"`);
    }

}
