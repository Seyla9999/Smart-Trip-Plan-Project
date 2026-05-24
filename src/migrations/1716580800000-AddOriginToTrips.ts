import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOriginToTrips1716580800000 implements MigrationInterface {
  name = 'AddOriginToTrips1716580800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "origin" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "trips" DROP COLUMN IF EXISTS "origin"`,
    );
  }
}