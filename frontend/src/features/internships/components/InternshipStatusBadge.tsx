import { Badge } from '../../../components/ui'
import { internshipStatusLabels } from '../internship.types'
export function InternshipStatusBadge({ status }: { status: string }) { return <Badge variant="info">{internshipStatusLabels[status] ?? status}</Badge> }
