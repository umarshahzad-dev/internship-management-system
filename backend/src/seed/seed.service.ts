import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { createHash } from 'crypto';
import { DepartmentEntity } from '../infrastructure/database/entities/department.entity';
import { UserEntity } from '../infrastructure/database/entities/user.entity';
import { UserSecurityStateEntity } from '../infrastructure/database/entities/user-security-state.entity';
import { DocumentTypeEntity } from '../infrastructure/database/entities/document-type.entity';
import { SystemConfigEntity } from '../infrastructure/database/entities/system-config.entity';
import { CompanyEntity } from '../infrastructure/database/entities/company.entity';
import { AcademicCalendarEntity } from '../infrastructure/database/entities/academic-calendar.entity';
import { HolidayEntity } from '../infrastructure/database/entities/holiday.entity';
import { InternshipEntity } from '../infrastructure/database/entities/internship.entity';
import { ApplicationDocumentEntity } from '../infrastructure/database/entities/application-document.entity';
import { DailyLogEntity } from '../infrastructure/database/entities/daily-log.entity';
import { SgkTrackingEntity } from '../infrastructure/database/entities/sgk-tracking.entity';
import { EmployerEvaluationEntity } from '../infrastructure/database/entities/employer-evaluation.entity';
import { FinalGradeEntity } from '../infrastructure/database/entities/final-grade.entity';
import { EmployerTokenEntity } from '../infrastructure/database/entities/employer-token.entity';
import { AuditLogEntity } from '../infrastructure/database/entities/audit-log.entity';
import { NotificationOutboxEntity, OutboxStatus } from '../infrastructure/database/entities/notification-outbox.entity';
import { AnnouncementEntity } from '../infrastructure/database/entities/announcement.entity';
import { UserRole } from '../domain/value-objects/role.vo';
import { DocumentSource } from '../domain/enums/document-source.enum';
import { ApplicationDocumentStatus } from '../domain/enums/application-document-status.enum';
import { InternshipStatus } from '../domain/enums/internship-status.enum';
import { SgkStatus } from '../domain/enums/sgk-status.enum';
import { EvaluationMethod } from '../domain/enums/evaluation-method.enum';
import { EmployerTokenType } from '../domain/enums/employer-token-type.enum';

type SeedUser = { email: string; role: UserRole; firstName: string; lastName: string; departmentId: string | null; studentNumber?: string | null; profilePhotoPath?: string | null };

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(DepartmentEntity) private readonly departmentRepository: Repository<DepartmentEntity>,
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserSecurityStateEntity) private readonly securityStateRepository: Repository<UserSecurityStateEntity>,
    @InjectRepository(DocumentTypeEntity) private readonly documentTypeRepository: Repository<DocumentTypeEntity>,
    @InjectRepository(SystemConfigEntity) private readonly systemConfigRepository: Repository<SystemConfigEntity>,
    @InjectRepository(CompanyEntity) private readonly companyRepository: Repository<CompanyEntity>,
    @InjectRepository(AcademicCalendarEntity) private readonly calendarRepository: Repository<AcademicCalendarEntity>,
    @InjectRepository(HolidayEntity) private readonly holidayRepository: Repository<HolidayEntity>,
    @InjectRepository(InternshipEntity) private readonly internshipRepository: Repository<InternshipEntity>,
    @InjectRepository(ApplicationDocumentEntity) private readonly applicationDocumentRepository: Repository<ApplicationDocumentEntity>,
    @InjectRepository(DailyLogEntity) private readonly dailyLogRepository: Repository<DailyLogEntity>,
    @InjectRepository(SgkTrackingEntity) private readonly sgkRepository: Repository<SgkTrackingEntity>,
    @InjectRepository(EmployerEvaluationEntity) private readonly evaluationRepository: Repository<EmployerEvaluationEntity>,
    @InjectRepository(FinalGradeEntity) private readonly finalGradeRepository: Repository<FinalGradeEntity>,
    @InjectRepository(EmployerTokenEntity) private readonly employerTokenRepository: Repository<EmployerTokenEntity>,
    @InjectRepository(AuditLogEntity) private readonly auditLogRepository: Repository<AuditLogEntity>,
    @InjectRepository(NotificationOutboxEntity) private readonly notificationRepository: Repository<NotificationOutboxEntity>,
    @InjectRepository(AnnouncementEntity) private readonly announcementRepository: Repository<AnnouncementEntity>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.NODE_ENV === 'production' || process.env.SEED !== 'true') {
      this.logger.warn('Seed skipped: requires NODE_ENV !== production and SEED=true');
      return;
    }
    this.logger.log('Seeding deterministic demo data...');
    const departments = await this.seedDepartments();
    const users = await this.seedUsers(departments);
    const companies = await this.seedCompanies();
    const documentTypes = await this.seedDocumentTypes(departments);
    await this.seedCalendars(departments);
    await this.seedHolidays(departments);
    const internships = await this.seedInternships(users, companies, departments);
    await this.seedApplicationDocuments(internships, documentTypes);
    await this.seedDailyLogs(internships);
    await this.seedSgk(internships);
    await this.seedEvaluations(internships);
    await this.seedFinalGrades(internships);
    await this.seedEmployerTokens(internships);
    await this.seedSystemConfigs();
    await this.seedAuditLogs(users);
    await this.seedNotifications(users);
    await this.seedAnnouncements();
    this.logger.log('Demo data seeding completed.');
  }

  private date(value: string): Date { return new Date(`${value}T12:00:00.000Z`); }

  private async seedDepartments(): Promise<Record<string, DepartmentEntity>> {
    const definitions = [['computer', 'Computer Engineering', 'Engineering'], ['electrical', 'Electrical-Electronics Engineering', 'Engineering'], ['software', 'Software Engineering', 'Technology']] as const;
    const result: Record<string, DepartmentEntity> = {};
    for (const [key, name, facultyName] of definitions) {
      let entity = await this.departmentRepository.findOne({ where: { name } });
      if (!entity) entity = await this.departmentRepository.save(this.departmentRepository.create({ name, facultyName }));
      result[key] = entity;
    }
    return result;
  }

  private async seedUsers(departments: Record<string, DepartmentEntity>): Promise<Record<string, UserEntity>> {
    const definitions: Record<string, SeedUser> = {
      admin: { email: 'admin@example.com', role: UserRole.ADMIN, firstName: 'Sistem', lastName: 'Yöneticisi', departmentId: null },
      academicComputer: { email: 'academic@example.com', role: UserRole.ACADEMIC, firstName: 'Ayşe', lastName: 'Demir', departmentId: departments.computer.id, profilePhotoPath: '/uploads/demo/ayse-demir.jpg' },
      academicElectrical: { email: 'academic.ee@example.com', role: UserRole.ACADEMIC, firstName: 'Murat', lastName: 'Kaya', departmentId: departments.electrical.id, profilePhotoPath: '/uploads/demo/murat-kaya.jpg' },
      administrativeComputer: { email: 'admin_staff@example.com', role: UserRole.ADMINISTRATIVE, firstName: 'Elif', lastName: 'Şahin', departmentId: departments.computer.id },
      administrativeSoftware: { email: 'admin_staff.software@example.com', role: UserRole.ADMINISTRATIVE, firstName: 'Burak', lastName: 'Öztürk', departmentId: departments.software.id },
      studentComputer: { email: 'student@example.com', role: UserRole.STUDENT, firstName: 'Zeynep', lastName: 'Yıldız', departmentId: departments.computer.id, studentNumber: '20260001', profilePhotoPath: '/uploads/demo/zeynep-yildiz.jpg' },
      studentElectrical: { email: 'student.ee@example.com', role: UserRole.STUDENT, firstName: 'Emre', lastName: 'Aydın', departmentId: departments.electrical.id, studentNumber: '20260002', profilePhotoPath: '/uploads/demo/emre-aydin.jpg' },
    };
    const result: Record<string, UserEntity> = {};
    for (const [key, input] of Object.entries(definitions)) {
      let user = await this.userRepository.findOne({ where: { email: input.email } });
      if (!user) user = this.userRepository.create({ email: input.email, passwordHash: await argon2.hash('Test1234') });
      Object.assign(user, { role: input.role, firstName: input.firstName, lastName: input.lastName, departmentId: input.departmentId, studentNumber: input.studentNumber ?? null, profilePhotoPath: input.profilePhotoPath ?? null, isActive: true });
      user = await this.userRepository.save(user);
      let security = await this.securityStateRepository.findOne({ where: { userId: user.id } });
      if (!security) security = this.securityStateRepository.create({ userId: user.id, failedLoginAttempts: 0, lockedUntil: null, passwordChangedAt: this.date('2026-01-01') });
      await this.securityStateRepository.save(security);
      result[key] = user;
    }
    return result;
  }

  private async seedCompanies(): Promise<CompanyEntity[]> {
    const definitions = [
      ['Anka Yazılım A.Ş.', '4200000001', 'SGK-ANKA-001', 'TR120006200000000000000001', 'Konya', 'Fintech', 'Derya Koç', 'derya.koc@anka.example', '+90 332 555 1001', true, true],
      ['Selçuk Otomasyon Ltd.', '4200000002', 'SGK-SEL-002', 'TR120006200000000000000002', 'Ankara', 'Industrial Automation', 'Mehmet Çetin', 'mehmet.cetin@selcuk.example', '+90 312 555 1002', true, true],
      ['Mavi Bulut Teknoloji', '4200000003', null, 'TR120006200000000000000003', 'İstanbul', 'Cloud Services', 'Seda Arslan', 'seda.arslan@mavibulut.example', '+90 212 555 1003', false, true],
      ['Eksen Enerji Sistemleri', '4200000004', 'SGK-EKS-004', 'TR120006200000000000000004', 'İzmir', 'Energy', 'Oğuz Er', 'oguz.er@eksen.example', '+90 232 555 1004', true, false],
      ['Karatay Savunma Ar-Ge', '4200000005', 'SGK-KAR-005', 'TR120006200000000000000005', 'Konya', 'Defense R&D', 'Nihan Akın', 'nihan.akin@karatay.example', '+90 332 555 1005', false, true],
    ] as const;
    const result: CompanyEntity[] = [];
    for (const [name, taxNumber, sgkNumber, iban, city, industry, contactPerson, contactEmail, contactPhone, isVerified, isActive] of definitions) {
      let company = await this.companyRepository.findOne({ where: { taxNumber } });
      if (!company) company = this.companyRepository.create({ taxNumber });
      Object.assign(company, { name, sgkNumber, iban, city, industry, contactPerson, contactEmail, contactPhone, address: `${city} Organize Sanayi Bölgesi`, website: `https://www.${taxNumber}.example`, isVerified, isActive });
      result.push(await this.companyRepository.save(company));
    }
    return result;
  }

  private async seedDocumentTypes(departments: Record<string, DepartmentEntity>): Promise<Record<string, DocumentTypeEntity[]>> {
    const result: Record<string, DocumentTypeEntity[]> = {};
    for (const [key, department] of Object.entries(departments)) {
      const definitions = [['Staj Başvuru Formu', 'Başvuru formu (sistem tarafından oluşturulur).', true, DocumentSource.SYSTEM_GENERATED], ['Müstehaklık Belgesi', 'e-Devlet üzerinden alınan zorunlu belge.', true, DocumentSource.EXTERNAL_UPLOAD], ['İşyeri Kabul Yazısı', 'İşyerinden imzalı kabul yazısı.', true, DocumentSource.EXTERNAL_UPLOAD], ['Kimlik Fotokopisi', 'İsteğe bağlı kimlik belgesi.', false, DocumentSource.EXTERNAL_UPLOAD]] as const;
      const docs: DocumentTypeEntity[] = [];
      for (const [name, description, isRequired, source] of definitions) {
        let document = await this.documentTypeRepository.findOne({ where: { departmentId: department.id, name } });
        if (!document) document = this.documentTypeRepository.create({ departmentId: department.id, name });
        Object.assign(document, { description, isRequired, source, allowedFileTypes: ['pdf', 'jpg', 'png'], maxFileSize: 5, templatePath: source === DocumentSource.SYSTEM_GENERATED ? `/templates/${key}-application.pdf` : null });
        docs.push(await this.documentTypeRepository.save(document));
      }
      result[key] = docs;
    }
    return result;
  }

  private async seedCalendars(departments: Record<string, DepartmentEntity>): Promise<void> {
    for (const department of Object.values(departments)) {
      const definitions = [['2024-2025 Güz', '2024-06-01', '2024-07-15', '2024-07-20', '2024-09-01'], ['2026-2027 Güz Stajı', '2026-09-01', '2026-10-15', '2026-10-20', '2026-12-15']] as const;
      for (const [termName, applicationStart, applicationEnd, internshipStart, internshipEnd] of definitions) {
        let calendar = await this.calendarRepository.findOne({ where: { departmentId: department.id, termName } });
        if (!calendar) calendar = this.calendarRepository.create({ departmentId: department.id, termName });
        Object.assign(calendar, { applicationStart: this.date(applicationStart), applicationEnd: this.date(applicationEnd), internshipStart: this.date(internshipStart), internshipEnd: this.date(internshipEnd) });
        await this.calendarRepository.save(calendar);
      }
    }
  }

  private async seedHolidays(departments: Record<string, DepartmentEntity>): Promise<void> {
    const definitions = [['2026-01-01', 'Yılbaşı', null], ['2026-04-23', 'Ulusal Egemenlik ve Çocuk Bayramı', null], ['2026-05-01', 'Emek ve Dayanışma Günü', null], ['2026-05-19', 'Atatürk\'ü Anma, Gençlik ve Spor Bayramı', null], ['2026-07-15', 'Demokrasi ve Milli Birlik Günü', departments.computer.id], ['2026-08-30', 'Zafer Bayramı', departments.electrical.id]] as const;
    for (const [holidayDate, name, departmentId] of definitions) {
      let holiday = await this.holidayRepository.findOne({ where: { holidayDate: this.date(holidayDate), name } });
      if (!holiday) holiday = this.holidayRepository.create({ holidayDate: this.date(holidayDate), name });
      holiday.departmentId = departmentId;
      await this.holidayRepository.save(holiday);
    }
  }

  private async seedInternships(users: Record<string, UserEntity>, companies: CompanyEntity[], departments: Record<string, DepartmentEntity>): Promise<InternshipEntity[]> {
    const definitions: Array<[string, InternshipStatus, number, string, string, string]> = [['studentComputer', InternshipStatus.DRAFT, 0, '2026-07-01', '2026-07-28', 'draft'], ['studentComputer', InternshipStatus.PENDING_EMPLOYER, 1, '2026-07-01', '2026-07-28', 'employer'], ['studentComputer', InternshipStatus.PENDING_COMMISSION, 2, '2026-07-01', '2026-07-28', 'commission'], ['studentComputer', InternshipStatus.APPROVED_PENDING_SGK, 3, '2026-07-01', '2026-07-28', 'sgk'], ['studentComputer', InternshipStatus.ONGOING, 0, '2026-06-01', '2026-06-28', 'ongoing'], ['studentComputer', InternshipStatus.EVALUATION, 1, '2026-05-01', '2026-05-28', 'evaluation'], ['studentElectrical', InternshipStatus.GRADED, 2, '2026-04-01', '2026-04-28', 'graded'], ['studentElectrical', InternshipStatus.COMPLETED, 3, '2026-03-01', '2026-03-28', 'completed'], ['studentElectrical', InternshipStatus.REVISION, 4, '2026-07-10', '2026-08-06', 'revision'], ['studentElectrical', InternshipStatus.REJECTED, 0, '2026-07-10', '2026-08-06', 'rejected']];
    const result: InternshipEntity[] = [];
    for (const [studentKey, status, companyIndex, start, end, seedKey] of definitions) {
      const student = users[studentKey];
      const company = companies[companyIndex];
      const departmentId = student.departmentId ?? departments.computer.id;
      let internship = await this.internshipRepository.findOne({ where: { studentId: student.id, companyId: company.id, status, startDate: this.date(start) } });
      if (!internship) internship = this.internshipRepository.create({ studentId: student.id, companyId: company.id });
      Object.assign(internship, { departmentId, status, startDate: this.date(start), endDate: this.date(end), gradingData: { seedKey, academicScore: [InternshipStatus.GRADED, InternshipStatus.COMPLETED].includes(status) ? 88 : null }, locked: [InternshipStatus.EVALUATION, InternshipStatus.GRADED, InternshipStatus.COMPLETED].includes(status), approvedAt: [InternshipStatus.APPROVED_PENDING_SGK, InternshipStatus.ONGOING, InternshipStatus.EVALUATION, InternshipStatus.GRADED, InternshipStatus.COMPLETED].includes(status) ? this.date('2026-04-01') : null, employerLogsApprovedAt: [InternshipStatus.EVALUATION, InternshipStatus.GRADED, InternshipStatus.COMPLETED].includes(status) ? this.date('2026-06-01') : null });
      result.push(await this.internshipRepository.save(internship));
    }
    return result;
  }

  private async seedApplicationDocuments(internships: InternshipEntity[], documentTypes: Record<string, DocumentTypeEntity[]>): Promise<void> {
    for (const internship of internships.filter((item) => item.status !== InternshipStatus.DRAFT)) {
      const docs = Object.values(documentTypes).find((items) => items[0]?.departmentId === internship.departmentId) ?? [];
      for (const [index, documentType] of docs.filter((item) => item.source === DocumentSource.EXTERNAL_UPLOAD).entries()) {
        const status = index === 0 && internship.status === InternshipStatus.REJECTED ? ApplicationDocumentStatus.REJECTED : index === 0 ? ApplicationDocumentStatus.ACCEPTED : ApplicationDocumentStatus.PENDING;
        const versions = internship.status === InternshipStatus.REVISION && index === 0 ? [1, 2] : [1];
        for (const versionNumber of versions) {
          let document = await this.applicationDocumentRepository.findOne({ where: { internshipId: internship.id, documentTypeId: documentType.id, versionNumber } });
          if (!document) document = this.applicationDocumentRepository.create({ internshipId: internship.id, documentTypeId: documentType.id, versionNumber });
          Object.assign(document, { filePath: `/uploads/demo/internships/${internship.id}/${documentType.id}-v${versionNumber}.pdf`, originalFilename: `${documentType.name.replace(/\s+/g, '-')}-v${versionNumber}.pdf`, status, rejectionReason: status === ApplicationDocumentStatus.REJECTED ? 'Belge okunaklı değil, lütfen yeniden yükleyin.' : null });
          await this.applicationDocumentRepository.save(document);
        }
      }
    }
  }

  private async seedDailyLogs(internships: InternshipEntity[]): Promise<void> {
    for (const internship of internships.filter((item) => [InternshipStatus.ONGOING, InternshipStatus.EVALUATION, InternshipStatus.GRADED, InternshipStatus.COMPLETED].includes(item.status))) {
      for (let day = 0; day < 3; day += 1) {
        const startDate = new Date(internship.startDate);
        const logDate = new Date(startDate.getTime() + day * 86400000);
        let log = await this.dailyLogRepository.findOne({ where: { internshipId: internship.id, logDate } });
        if (!log) log = this.dailyLogRepository.create({ internshipId: internship.id, logDate });
        log.content = `Gün ${day + 1}: Takım toplantısına katıldım, görev planını güncelledim ve ${internship.status.toLowerCase()} sürecindeki geliştirme çalışmalarını tamamladım.`;
        await this.dailyLogRepository.save(log);
      }
    }
  }

  private async seedSgk(internships: InternshipEntity[]): Promise<void> {
    const eligible = internships.filter((item) => [InternshipStatus.APPROVED_PENDING_SGK, InternshipStatus.ONGOING, InternshipStatus.EVALUATION, InternshipStatus.GRADED, InternshipStatus.COMPLETED].includes(item.status));
    for (const [index, internship] of eligible.entries()) {
      const status = index === 0 ? SgkStatus.PENDING : index === 1 ? SgkStatus.SUBMITTED : SgkStatus.ACTIVE;
      let record = await this.sgkRepository.findOne({ where: { internshipId: internship.id } });
      if (!record) record = this.sgkRepository.create({ internshipId: internship.id });
      Object.assign(record, { status, documentPath: status === SgkStatus.PENDING ? null : `/uploads/demo/sgk/${internship.id}.pdf` });
      await this.sgkRepository.save(record);
    }
  }

  private async seedEvaluations(internships: InternshipEntity[]): Promise<void> {
    const eligible = internships.filter((item) => [InternshipStatus.EVALUATION, InternshipStatus.GRADED, InternshipStatus.COMPLETED].includes(item.status));
    const grades = { attendance: 'A', effort: 'B', timeliness: 'A', conduct: 'A', teamwork: 'B', ethics: 'A', selfImprovement: 'B' };
    for (const [index, internship] of eligible.entries()) {
      let evaluation = await this.evaluationRepository.findOne({ where: { internshipId: internship.id } });
      if (!evaluation) evaluation = this.evaluationRepository.create({ internshipId: internship.id });
      Object.assign(evaluation, { method: index === 0 ? EvaluationMethod.MANUAL : EvaluationMethod.DIGITAL, employerName: index === 0 ? 'Mavi Bulut Teknoloji' : 'Anka Yazılım A.Ş.', enteredBy: null, grades, comments: 'Öğrenci takım çalışmasına uyumlu ve sorumluluk sahibidir.', scannedSicilFisiPath: index === 0 ? `/uploads/demo/evaluations/${internship.id}-sicil-fisi.pdf` : null });
      await this.evaluationRepository.save(evaluation);
      internship.employerLogsApprovedAt = internship.employerLogsApprovedAt ?? this.date('2026-06-01');
      await this.internshipRepository.save(internship);
    }
  }

  private async seedFinalGrades(internships: InternshipEntity[]): Promise<void> {
    for (const internship of internships.filter((item) => [InternshipStatus.GRADED, InternshipStatus.COMPLETED].includes(item.status))) {
      let grade = await this.finalGradeRepository.findOne({ where: { internshipId: internship.id } });
      if (!grade) grade = this.finalGradeRepository.create({ internshipId: internship.id });
      Object.assign(grade, { employerScore: 86, academicScore: 90, finalScore: 88, letterGrade: 'BA' });
      await this.finalGradeRepository.save(grade);
    }
  }

  private async seedEmployerTokens(internships: InternshipEntity[]): Promise<void> {
    const internship = internships.find((item) => item.status === InternshipStatus.EVALUATION);
    if (!internship) return;
    const tokenHash = createHash('sha256').update('demo-employer-evaluation-token').digest('hex');
    let token = await this.employerTokenRepository.findOne({ where: { tokenHash } });
    if (!token) token = this.employerTokenRepository.create({ tokenHash });
    Object.assign(token, { internshipId: internship.id, tokenType: EmployerTokenType.EVALUATION, expiresAt: this.date('2027-12-31'), isUsed: false, usedAt: null });
    await this.employerTokenRepository.save(token);
  }

  private async seedSystemConfigs(): Promise<void> {
    const defaults = [['ACADEMIC_YEAR', '2026-2027', 'Aktif akademik öğretim yılı', true], ['ACTIVE_SEMESTER', 'YAZ', 'Aktif staj dönemi', true], ['MIN_INTERNSHIP_DAYS', '20', 'Minimum zorunlu staj iş günü sayısı', false], ['MAX_INTERNSHIP_DAYS', '40', 'Maksimum zorunlu staj iş günü sayısı', false], ['APP_SUBMISSION_DEADLINE', '2026-06-30', 'Staj başvuru evrakları son teslim tarihi', true]] as const;
    for (const [key, value, description, isPublic] of defaults) {
      let config = await this.systemConfigRepository.findOne({ where: { key } });
      if (!config) config = this.systemConfigRepository.create({ key });
      Object.assign(config, { value, description, isPublic });
      await this.systemConfigRepository.save(config);
    }
  }

  private async seedAuditLogs(users: Record<string, UserEntity>): Promise<void> {
    const definitions = [[users.admin.id, UserRole.ADMIN, 'POST', '/api/v1/demo-seed/auth-login', { seedTag: 'demo-login' }, 200], [users.studentComputer.id, UserRole.STUDENT, 'POST', '/api/v1/demo-seed/internship-create', { seedTag: 'demo-internship-create' }, 201], [users.academicComputer.id, UserRole.ACADEMIC, 'PATCH', '/api/v1/demo-seed/internship-approve', { seedTag: 'demo-approve' }, 200]] as const;
    for (const [userId, userRole, method, path, payload, statusCode] of definitions) {
      if (!(await this.auditLogRepository.findOne({ where: { path } }))) await this.auditLogRepository.save(this.auditLogRepository.create({ userId, userRole, method, path, payload, ipAddress: '127.0.0.1', statusCode }));
    }
  }

  private async seedNotifications(users: Record<string, UserEntity>): Promise<void> {
    const definitions = [[users.studentComputer.email, 'Staj başvurunuz alındı', 'Başvurunuz komisyon incelemesine gönderildi.', OutboxStatus.SENT], [users.academicComputer.email, 'Yeni staj başvurusu', 'İncelemeniz gereken yeni bir başvuru var.', OutboxStatus.PENDING], [users.studentElectrical.email, 'SGK belgeniz hazır', 'SGK işe giriş bildirgeniz sisteme yüklendi.', OutboxStatus.SENT]] as const;
    for (const [recipientEmail, subject, body, status] of definitions) {
      if (!(await this.notificationRepository.findOne({ where: { recipientEmail, subject } }))) await this.notificationRepository.save(this.notificationRepository.create({ recipientEmail, subject, body, status, retryCount: 0, lastError: null }));
    }
  }

  private async seedAnnouncements(): Promise<void> {
    const definitions = [
      ['2026 Yaz dönemi staj başvuruları', 'Başvuru evraklarınızı son teslim tarihinden önce bölüm komisyonuna iletmeyi unutmayın.', [UserRole.STUDENT, UserRole.ACADEMIC, UserRole.ADMINISTRATIVE] as UserRole[]],
      ['SGK belgeleri hakkında', 'Onaylanan stajlar SGK işlem kuyruğuna otomatik olarak aktarılır.', [UserRole.STUDENT, UserRole.ADMINISTRATIVE] as UserRole[]],
    ] as const;
    for (const [title, content, targetRoles] of definitions) {
      if (!(await this.announcementRepository.findOne({ where: { title } }))) {
        await this.announcementRepository.save(this.announcementRepository.create({ title, content, targetRoles, departmentId: null, expiresAt: this.date('2027-12-31'), isActive: true }));
      }
    }
  }
}
