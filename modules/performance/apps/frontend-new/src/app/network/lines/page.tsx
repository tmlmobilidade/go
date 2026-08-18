/* * */

import { NetworkLinesView } from '@/components/network-lines/NetworkLinesView';
import { PerformanceShell } from '@/components/shell/PerformanceShell';

/* * */

export default function Page() {
	return (
		<PerformanceShell>
			<NetworkLinesView />
		</PerformanceShell>
	);
}
