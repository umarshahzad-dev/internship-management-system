import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { ROLES_KEY } from './user/decorators/roles.decorator';
import { UserRole } from '../domain/value-objects/role.vo';
import { InternshipController } from './internship/internship.controller';
import { ApplicationDocumentController } from './application-document/application-document.controller';
import { DailyLogController } from './daily-log/daily-log.controller';
import { EmployerEvaluationController } from './employer-evaluation/employer-evaluation.controller';
import { ScoringController } from './scoring/scoring.controller';
import { SgkController } from './sgk/sgk.controller';
import { CompanyController } from './company/company.controller';
import { DocumentTypeController } from './document-type/document-type.controller';
import { AcademicCalendarController } from './calendar/academic-calendar.controller';
import { HolidayController } from './holiday/holiday.controller';

function rolesFor(controller: object, method: string): UserRole[] {
  return Reflect.getMetadata(ROLES_KEY, (controller as Record<string, unknown>)[method]) ?? [];
}

describe('Priority 0/1 authorization contract', () => {
  it('restricts internship records and review data to Student and Academic roles', () => {
    expect(rolesFor(InternshipController.prototype, 'list')).toEqual([
      UserRole.STUDENT,
      UserRole.ACADEMIC,
    ]);
    expect(rolesFor(InternshipController.prototype, 'getById')).toEqual([
      UserRole.STUDENT,
      UserRole.ACADEMIC,
    ]);
    expect(rolesFor(InternshipController.prototype, 'history')).toEqual([
      UserRole.STUDENT,
      UserRole.ACADEMIC,
    ]);
    expect(rolesFor(ApplicationDocumentController.prototype, 'list')).toEqual([
      UserRole.STUDENT,
      UserRole.ACADEMIC,
    ]);
    expect(rolesFor(DailyLogController.prototype, 'list')).toEqual([
      UserRole.STUDENT,
      UserRole.ACADEMIC,
    ]);
    expect(rolesFor(EmployerEvaluationController.prototype, 'getEvaluation')).toEqual([
      UserRole.STUDENT,
      UserRole.ACADEMIC,
    ]);
    expect(rolesFor(ScoringController.prototype, 'getGrade')).toEqual([
      UserRole.STUDENT,
      UserRole.ACADEMIC,
    ]);
  });

  it('reserves operational SGK work for Administrative staff', () => {
    for (const method of ['list', 'listByDepartment', 'createRecord', 'uploadDocument', 'uploadDocumentCanonical', 'updateStatus', 'history', 'transitionToOngoing']) {
      expect(rolesFor(SgkController.prototype, method)).toEqual([
        UserRole.ADMINISTRATIVE,
      ]);
    }
  });

  it('reserves administrative configuration mutations for Admin', () => {
    for (const method of ['create', 'update', 'deactivate', 'importCompanies']) {
      expect(rolesFor(CompanyController.prototype, method)).toEqual([UserRole.ADMIN]);
    }
    for (const method of ['create', 'update', 'delete', 'uploadTemplate']) {
      expect(rolesFor(DocumentTypeController.prototype, method)).toEqual([UserRole.ADMIN]);
    }
    expect(rolesFor(AcademicCalendarController.prototype, 'list')).toEqual([
      UserRole.STUDENT,
      UserRole.ACADEMIC,
      UserRole.ADMIN,
    ]);
    expect(rolesFor(HolidayController.prototype, 'list')).toEqual([
      UserRole.STUDENT,
      UserRole.ACADEMIC,
      UserRole.ADMIN,
    ]);
  });

  it('keeps lifecycle and Sicil Fişi actions with Academic staff', () => {
    expect(rolesFor(InternshipController.prototype, 'finalize')).toEqual([
      UserRole.ACADEMIC,
    ]);
    expect(rolesFor(InternshipController.prototype, 'getSicilFisi')).toEqual([
      UserRole.ACADEMIC,
    ]);
  });

  it('exposes the official document ecosystem to the documented roles', () => {
    expect(rolesFor(InternshipController.prototype, 'getZorunluStajBelgesi')).toEqual([
      UserRole.STUDENT,
      UserRole.ACADEMIC,
      UserRole.ADMIN,
    ]);
    expect(rolesFor(InternshipController.prototype, 'getApplicationForm')).toEqual([
      UserRole.STUDENT,
      UserRole.ACADEMIC,
      UserRole.ADMINISTRATIVE,
    ]);
    expect(rolesFor(DailyLogController.prototype, 'generateDefter')).toEqual([
      UserRole.STUDENT,
      UserRole.ACADEMIC,
    ]);
  });
});
