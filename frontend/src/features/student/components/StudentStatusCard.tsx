import { Badge, Panel } from '../../../components/ui'
export function StudentStatusCard({ status }: { status: string }) { return <Panel title="Staj durumu"><Badge variant="info">{status}</Badge></Panel> }
