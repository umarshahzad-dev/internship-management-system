import { Injectable } from '@nestjs/common';
import { IAcademicCalendarRepository } from '../../ports/academic-calendar.repository.port';
import { IDateProvider } from '../../ports/date-provider.port';
import { DomainException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class GetNextTermUseCase {
  constructor(
    private readonly calendarRepository: IAcademicCalendarRepository,
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(departmentId: string) {
    const nextTerm = await this.calendarRepository.findNextTerm(
      departmentId,
      this.dateProvider.now(),
    );
    if (!nextTerm) {
      throw new DomainException('NOT_FOUND', 'No future term found', 404);
    }
    return {
      id: nextTerm.id,
      departmentId: nextTerm.departmentId,
      termName: nextTerm.termName,
      applicationStart: nextTerm.applicationStart.toISOString().slice(0, 10),
      applicationEnd: nextTerm.applicationEnd.toISOString().slice(0, 10),
      internshipStart: nextTerm.internshipStart.toISOString().slice(0, 10),
      internshipEnd: nextTerm.internshipEnd.toISOString().slice(0, 10),
    };
  }
}
