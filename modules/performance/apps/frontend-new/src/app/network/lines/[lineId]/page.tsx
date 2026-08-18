/* * */

import { LineDetailOverview } from '@/components/line-detail/LineDetailOverview';
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
			<LineDetailOverview lineId={lineId} />
		</PerformanceShell>
	);
}
