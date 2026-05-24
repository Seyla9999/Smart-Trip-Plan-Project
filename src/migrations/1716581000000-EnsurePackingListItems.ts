import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnsurePackingListItems1716581000000
  implements MigrationInterface
{
  name = 'EnsurePackingListItems1716581000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF to_regclass('public.packing_list_items') IS NULL THEN
          IF to_regclass('public.packing_items') IS NOT NULL THEN
            ALTER TABLE public.packing_items RENAME TO packing_list_items;
          ELSE
            CREATE TABLE public.packing_list_items (
              id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
              trip_id uuid NOT NULL,
              name character varying NOT NULL,
              quantity integer NOT NULL DEFAULT 1,
              packed boolean NOT NULL DEFAULT false,
              CONSTRAINT fk_packing_list_items_trip
                FOREIGN KEY (trip_id)
                REFERENCES public.trips(id)
                ON DELETE CASCADE
            );
          END IF;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_packing_list_items_trip_id
      ON public.packing_list_items (trip_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_packing_list_items_trip_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.packing_list_items`);
  }
}
