/* * */

import { LineOverviewDashboard } from '@/components/line-detail/overview/LineOverviewDashboard';
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
			<LineOverviewDashboard lineId={lineId} />
		</PerformanceShell>
	);
}
