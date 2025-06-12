'use client';

/* * */

import { PlansListFilters } from '@/components/plans/list/PlansListFilters';
import { PlansListHeader } from '@/components/plans/list/PlansListHeader';
import { usePlanListContext } from '@/contexts/PlanList.context';
import { Routes } from '@/lib/routes';
import { IconArrowRight, IconLock, IconLockOpen } from '@tabler/icons-react';
import { Pane, Section, Tag } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';

import styles from './styles.module.css';

/* * */

export function PlanList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { data, flags } = usePlanListContext();

	//
	// B. Render components

	if (flags.isLoading) {
		return <div>Loading...</div>;
	}
	else if (flags.error) {
		return <div>Error: {flags.error.message}</div>;
	}

	return (
		<Pane header={[
			<PlansListHeader />,
			<PlansListFilters />,
		]}
		>
			{data.filtered.map(plan => (
				<div key={plan._id} className={styles.root} onClick={() => router.push(Routes.PLAN_DETAIL(plan._id))}>
					<Section alignItems="center" flexDirection="row" flexWrap="wrap" gap="sm">
						<Tag label={plan._id} variant="muted" />
						<Tag label={plan.gtfs_agency.agency_name} variant="secondary" />
					</Section>
					<Section alignItems="center" flexDirection="row" gap="md">
						<Section alignItems="center" flexDirection="row" gap="sm">
							<Tag label={Dates.fromOperationalDate(plan.gtfs_feed_info.feed_start_date, 'Europe/Lisbon').toLocaleString(Dates.FORMATS.DATE_SHORT)} variant="success" />
							<IconArrowRight size={16} />
							<Tag
								label={Dates.fromOperationalDate(plan.gtfs_feed_info.feed_end_date, 'Europe/Lisbon').toLocaleString(Dates.FORMATS.DATE_SHORT)}
								variant={
									Dates.now('local').operational_date > Dates.fromOperationalDate(plan.gtfs_feed_info.feed_end_date, 'Europe/Lisbon').operational_date ? 'danger' : 'warning'
								}
							/>
						</Section>

						{plan.is_locked ? <IconLock color="var(--color-status-danger-primary)" /> : <IconLockOpen color="var(--color-status-success-primary)" />}
					</Section>
				</div>
			))}
		</Pane>
	);

	//
}
