import { Panel } from '../../../components/ui'
export function AdminScopeBanner({ departmentName = 'Tüm bölümler' }: { departmentName?: string }) { return <Panel className="border-gold/60 bg-gold/5"><p className="text-xs font-semibold uppercase tracking-wide text-navy">Yönetim kapsamı</p><p className="mt-1 text-sm text-gray-700">{departmentName}</p></Panel> }
