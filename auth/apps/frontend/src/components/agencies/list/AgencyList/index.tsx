'use client';

/* * */

import { useAgencyListContext } from '@/contexts/AgencyList.context';
import { Routes } from '@/lib/routes';
import { Loader, Pane, Section, Tag, Text } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import styles from './styles.module.css';

import { AgencyListHeader } from '../AgencyListHeader';

/* * */

export function AgencyList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { data, flags } = useAgencyListContext();

	//
	// B. Render components

	if (flags.loading) {
		return <Loader />;
	}

	if (flags.error) {
		return <div>Error: {flags.error.message}</div>;
	}

	return (
		<Pane header={[<AgencyListHeader />]}>
			{data.filtered.map(agency => (
				<div key={agency._id} className={styles.root} onClick={() => router.push(Routes.AGENCY_DETAIL(agency._id))}>
					<Section alignItems="center" flexDirection="row" flexWrap="nowrap" gap="sm">
						<Tag label={agency._id} variant="muted" />
						<Text size="lg">{agency.name}</Text>
					</Section>
				</div>
			))}
		</Pane>
	);

	//
}
