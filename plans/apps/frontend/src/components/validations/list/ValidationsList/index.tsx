'use client';

/* * */

import { ValidationsListFilters } from '@/components/validations/list/ValidationsListFilters';
import { ValidationsListHeader } from '@/components/validations/list/ValidationsListHeader';
import { useValidationListContext } from '@/contexts/ValidationList.context';
import { IconArrowRight } from '@tabler/icons-react';
import { AVAILABLE_AGENCIES } from '@tmlmobilidade/lib';
import { Pane, Section, Tag } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';

import styles from './styles.module.css';

/* * */

export function ValidationList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { data, flags } = useValidationListContext();

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
			<ValidationsListHeader />,
			<ValidationsListFilters />,
		]}
		>
			{data.filtered.map(Validation => (
				<div className={styles.root} onClick={() => router.push(`/validations/${Validation._id}`)}>
					<Section key={Validation._id} alignItems="center" flexDirection="row" flexWrap="wrap" gap="sm">
						<Tag label={Validation._id} variant="muted" />
						<Tag label={AVAILABLE_AGENCIES.find(agency => agency._id === Validation.agency_id)?.name} variant="secondary" />
					</Section>
					<Section alignItems="center" flexDirection="row" gap="md">
						<Section alignItems="center" flexDirection="row" gap="sm">
							<Tag label={Dates.fromOperationalDate(Validation.valid_from).toLocaleString(Dates.FORMATS.DATE_SHORT)} variant="success" />
							<IconArrowRight size={16} />
							<Tag
								label={Dates.fromOperationalDate(Validation.valid_until).toLocaleString(Dates.FORMATS.DATE_SHORT)}
								variant={
									Dates.now().operational_date > Validation.valid_until ? 'danger' : 'warning'
								}
							/>
						</Section>
					</Section>
				</div>
			))}
		</Pane>
	);

	//
}
