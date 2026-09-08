import { Badge } from '../../../components/ui'
export function ReviewStatus({ status }: { status: string }) { return <Badge variant={status === 'APPROVED' ? 'success' : 'warning'}>{status}</Badge> }
