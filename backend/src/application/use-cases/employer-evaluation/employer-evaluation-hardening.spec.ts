import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createHash } from 'crypto';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { EmployerTokenType } from '../../../domain/enums/employer-token-type.enum';
import { ValidateEmployerTokenUseCase } from './validate-employer-token.use-case';
import { SubmitDigitalEvaluationUseCase } from './submit-digital-evaluation.use-case';

describe('employer evaluation hardening', () => {
  const now = new Date('2026-09-08T10:00:00.000Z');
  const token = 'evaluation-token';
  const tokenHash = createHash('sha256').update(token).digest('hex');
  let tokenRepository: any;
  let internshipRepository: any;
  let evaluationRepository: any;
  let dateProvider: any;

  beforeEach(() => {
    tokenRepository = {
      findByTokenHash: vi.fn(),
      findActiveByInternship: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };
    internshipRepository = {
      findById: vi.fn(),
      findAllByStudent: vi.fn(),
      findAllByDepartment: vi.fn(),
      findActiveByStudent: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };
    evaluationRepository = {
      findByInternship: vi.fn(),
      create: vi.fn(),
    };
    dateProvider = { now: vi.fn().mockReturnValue(now) };
  });

  it('rejects an application-approval token when validating an employer evaluation', async () => {
    tokenRepository.findByTokenHash.mockResolvedValue({
      tokenHash,
      internshipId: 'internship-1',
      type: EmployerTokenType.APPLICATION_APPROVAL,
      isUsed: false,
      isExpired: vi.fn().mockReturnValue(false),
    });

    const useCase = new ValidateEmployerTokenUseCase(
      tokenRepository,
      internshipRepository,
      { findById: vi.fn() },
      { findById: vi.fn() },
    );

    await expect(useCase.execute({ plainToken: token })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    } satisfies Partial<DomainException>);
  });

  it('records the employer log approval timestamp when a digital evaluation is submitted', async () => {
    tokenRepository.findByTokenHash.mockResolvedValue({
      tokenHash,
      internshipId: 'internship-1',
      type: EmployerTokenType.EVALUATION,
      expiresAt: new Date('2026-09-09T10:00:00.000Z'),
      isUsed: false,
      createdAt: now,
      isExpired: vi.fn().mockReturnValue(false),
    });
    const internship = {
      id: 'internship-1',
      markEmployerLogsApproved: vi.fn(),
    };
    internshipRepository.findById.mockResolvedValue(internship);
    evaluationRepository.findByInternship.mockResolvedValue(null);
    evaluationRepository.create.mockImplementation(async (evaluation: any) => evaluation);

    const useCase = new SubmitDigitalEvaluationUseCase(
      tokenRepository,
      evaluationRepository,
      internshipRepository,
      dateProvider,
    );

    await useCase.execute({
      plainToken: token,
      employerName: 'KTUN Employer',
      grades: {
        attendance: 'A',
        effort: 'A',
        timeliness: 'A',
        conduct: 'A',
        teamwork: 'A',
        ethics: 'A',
        self_improvement: 'A',
      },
    });

    expect(internship.markEmployerLogsApproved).toHaveBeenCalledWith(now);
    expect(internshipRepository.update).toHaveBeenCalledWith(internship);
  });
});
