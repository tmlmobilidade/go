'use client';

/* * */

import { StopsDetailAlerts } from '@/components/stops/detail/StopsDetailAlerts';
import { StopsDetailContent } from '@/components/stops/detail/StopsDetailContent';
import { StopsDetailHeader } from '@/components/stops/detail/StopsDetailHeader';

/* * */

export function StopsDetail() {
	return (
		<>
			<StopsDetailHeader />
			<StopsDetailAlerts />
			<StopsDetailContent />
		</>
	);
}
