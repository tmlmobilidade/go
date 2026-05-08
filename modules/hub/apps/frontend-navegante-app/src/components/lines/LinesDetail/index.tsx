/* * */

import { LinesDetailAlerts } from '@/components/lines/LinesDetailAlerts';
import { LinesDetailHeader } from '@/components/lines/LinesDetailHeader';
import { LinesDetailPath } from '@/components/lines/LinesDetailPath';

/* * */

export function LinesDetail() {
	return (
		<>
			<LinesDetailHeader />
			<LinesDetailAlerts />
			<LinesDetailPath />
		</>
	);
}
