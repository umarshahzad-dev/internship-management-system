import { describe, expect, it, vi } from 'vitest';
import { ListApplicationDocumentsUseCase } from './list-application-documents.use-case';
import { ApplicationDocumentStatus } from '../../../domain/enums/application-document-status.enum';

describe('ListApplicationDocumentsUseCase', () => {
  it('projects document type metadata for review and checklist clients', async () => {
    const applicationDocumentRepository = {
      findLatestByInternship: vi.fn().mockResolvedValue([
        {
          id: 'document-1',
          internshipId: 'internship-1',
          documentTypeId: 'type-1',
          status: ApplicationDocumentStatus.PENDING,
          versionNumber: 2,
          originalFilename: 'kimlik.pdf',
          rejectionReason: null,
          uploadedAt: new Date('2026-01-02T10:00:00.000Z'),
        },
      ]),
    };
    const internshipRepository = {
      findById: vi.fn().mockResolvedValue({ departmentId: 'department-1', studentId: 'student-1' }),
    };
    const documentTypeRepository = {
      findById: vi.fn().mockResolvedValue({ name: 'Kimlik Fotokopisi', isRequired: true, source: 'EXTERNAL_UPLOAD' }),
    };

    const result = await new ListApplicationDocumentsUseCase(
      applicationDocumentRepository as never,
      internshipRepository as never,
      documentTypeRepository as never,
    ).execute({
      internshipId: 'internship-1',
      currentUserId: 'academic-1',
      currentUserRole: 'ACADEMIC',
      currentUserDepartmentId: 'department-1',
    });

    expect(result[0]).toMatchObject({
      documentTypeName: 'Kimlik Fotokopisi',
      documentTypeIsRequired: true,
      documentTypeSource: 'EXTERNAL_UPLOAD',
      versionNumber: 2,
    });
  });
});
