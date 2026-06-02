/* * */

import { LinesDetailAlerts } from '@/components/lines/detail/LinesDetailAlerts';
import { LinesDetailHeader } from '@/components/lines/detail/LinesDetailHeader';
import { LinesDetailPath } from '@/components/lines/detail/LinesDetailPath';

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
