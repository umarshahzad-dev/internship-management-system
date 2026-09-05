import { ApplicationDocument } from '../../domain/entities/application-document.entity';

export abstract class IApplicationDocumentRepository {
  abstract findById(id: string): Promise<ApplicationDocument | null>;
  abstract findByInternship(
    internshipId: string,
  ): Promise<ApplicationDocument[]>;
  abstract findLatestByInternship(
    internshipId: string,
  ): Promise<ApplicationDocument[]>;
  abstract findLatestByInternshipAndType(
    internshipId: string,
    documentTypeId: string,
  ): Promise<ApplicationDocument | null>;
  abstract findByInternshipAndType(
    internshipId: string,
    documentTypeId: string,
  ): Promise<ApplicationDocument | null>;
  abstract findAcceptedByInternship(
    internshipId: string,
  ): Promise<ApplicationDocument[]>;
  abstract create(document: ApplicationDocument): Promise<ApplicationDocument>;
  abstract update(document: ApplicationDocument): Promise<ApplicationDocument>;
}
