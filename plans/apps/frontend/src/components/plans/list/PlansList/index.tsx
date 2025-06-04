'use client';

/* * */

import { PlansListFilters } from '@/components/plans/list/PlansListFilters';
import { PlansListHeader } from '@/components/plans/list/PlansListHeader';
import { usePlanListContext } from '@/contexts/PlanList.context';
import { IconArrowRight, IconLock, IconLockOpen } from '@tabler/icons-react';
import { AVAILABLE_AGENCIES } from '@tmlmobilidade/lib';
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
				<div className={styles.root} onClick={() => router.push(`/plans/${plan._id}`)}>
					<Section key={plan._id} alignItems="center" flexDirection="row" flexWrap="wrap" gap="sm">
						<Tag label={plan._id} variant="muted" />
						<Tag label={AVAILABLE_AGENCIES.find(agency => agency._id === plan.agency_id)?.name} variant="secondary" />
					</Section>
					<Section alignItems="center" flexDirection="row" gap="md">
						<Section alignItems="center" flexDirection="row" gap="sm">
							<Tag label={Dates.fromOperationalDate(plan.valid_from, 'local').toLocaleString(Dates.FORMATS.DATE_SHORT)} variant="success" />
							<IconArrowRight size={16} />
							<Tag
								label={Dates.fromOperationalDate(plan.valid_until, 'local').toLocaleString(Dates.FORMATS.DATE_SHORT)}
								variant={
									Dates.now('local').operational_date > plan.valid_until ? 'danger' : 'warning'
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
