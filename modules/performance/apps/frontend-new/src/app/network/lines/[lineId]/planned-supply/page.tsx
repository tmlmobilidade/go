/* * */

import { LineSupplyDashboard } from '@/components/line-detail/supply/LineSupplyDashboard';
import { PerformanceShell } from '@/components/shell/PerformanceShell';

/* * */

interface PageProps { params: Promise<{ lineId: string }> }

/* * */

export default async function Page({ params }: PageProps) {
	const { lineId } = await params;
	return <PerformanceShell><LineSupplyDashboard lineId={lineId} /></PerformanceShell>;
}
