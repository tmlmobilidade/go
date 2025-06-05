'use client';

/* * */

import { StatusTag } from '@/components/common/StatusTag';
import { ValidationsListFilters } from '@/components/validations/list/ValidationsListFilters';
import { ValidationsListHeader } from '@/components/validations/list/ValidationsListHeader';
import { useValidationListContext } from '@/contexts/ValidationList.context';
import { AVAILABLE_AGENCIES } from '@tmlmobilidade/lib';
import { Pane, Section, Tag } from '@tmlmobilidade/ui';
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
				<div key={Validation._id} className={styles.root} onClick={() => router.push(`/validations/${Validation._id}`)}>
					<Section key={Validation._id} alignItems="center" flexDirection="row" flexWrap="wrap" gap="sm">
						<StatusTag status={Validation.feeder_status} />
						<Tag label={Validation._id} variant="primary" />
						<Tag label={Validation.gtfs_agency?.agency_name ? Validation.gtfs_agency.agency_name : 'N/A'} variant="secondary" />
					</Section>
				</div>
			))}
		</Pane>
	);

	//
}
