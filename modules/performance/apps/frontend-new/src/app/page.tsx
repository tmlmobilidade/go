/* * */

import { PulseView } from '@/components/pulse/PulseView';
import { PerformanceShell } from '@/components/shell/PerformanceShell';

/* * */

export default function Page() {
	return (
		<PerformanceShell>
			<PulseView />
		</PerformanceShell>
	);
}
