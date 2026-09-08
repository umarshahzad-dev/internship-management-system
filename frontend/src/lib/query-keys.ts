export const queryKeys = {
  auth: { me: ['auth', 'me'] as const },
  users: { all: ['users'] as const, detail: (id: string) => ['users', id] as const },
  departments: { all: ['departments'] as const },
  companies: { all: ['companies'] as const, detail: (id: string) => ['companies', id] as const },
  documentTypes: { all: ['document-types'] as const },
  internships: { all: ['internships'] as const, detail: (id: string) => ['internships', id] as const },
  dailyLogs: { list: (internshipId: string) => ['daily-logs', internshipId] as const },
  sgk: { all: ['sgk'] as const },
  systemConfigs: { public: ['system-configs', 'public'] as const, admin: ['system-configs', 'admin'] as const },
} as const
