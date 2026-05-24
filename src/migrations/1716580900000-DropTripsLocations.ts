import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropTripsLocations1716580900000 implements MigrationInterface {
  name = 'DropTripsLocations1716580900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "trips" DROP COLUMN IF EXISTS "locations"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "locations" json`,
    );
  }
}
