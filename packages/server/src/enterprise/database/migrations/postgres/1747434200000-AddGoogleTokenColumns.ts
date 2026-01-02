import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddGoogleTokenColumns1747434200000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "googleAccessToken" text;`)
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "googleRefreshToken" text;`)
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "googleTokenExpiry" timestamp;`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "googleAccessToken";`)
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "googleRefreshToken";`)
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "googleTokenExpiry";`)
    }
}
