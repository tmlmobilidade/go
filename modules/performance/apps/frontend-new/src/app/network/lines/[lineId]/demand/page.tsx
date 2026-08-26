/* * */

import { LineDemandDashboard } from '@/components/line-detail/demand/LineDemandDashboard';
import { PerformanceShell } from '@/components/shell/PerformanceShell';

/* * */

interface PageProps {
	params: Promise<{ lineId: string }>
}

/* * */

export default async function Page({ params }: PageProps) {
	const { lineId } = await params;

	return (
		<PerformanceShell>
			<LineDemandDashboard lineId={lineId} />
		</PerformanceShell>
	);
}
