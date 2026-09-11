import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropDepartmentIdFromAcademicCalendars1760000000000 implements MigrationInterface {
  name = 'DropDepartmentIdFromAcademicCalendars1760000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('academic_calendars');
    if (table?.findColumnByName('department_id')) await queryRunner.dropColumn('academic_calendars', 'department_id');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "academic_calendars" ADD "department_id" uuid NULL');
  }
}
