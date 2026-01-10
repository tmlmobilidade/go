/* * */

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { Label, Tag } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface PeriodsListCellAgencyProps {
	agencyId: string
}

/* * */

export function PeriodsListCellAgency({ agencyId }: PeriodsListCellAgencyProps) {
	const agenciesContext = useAgenciesContext();

	const agencyName = agenciesContext.data.raw.find(agency => agency._id === agencyId)?.name ?? '';

	return (
		<div className={styles.wrapper}>
			<Tag label={agencyId} variant="secondary" />
			<Label>{agencyName}</Label>
		</div>
	);
}
