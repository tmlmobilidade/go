/* * */

import { Label, Tag } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface ValidationsListCellAgencyProps {
	agencyId: string
	agencyName: string
}

/* * */

export function ValidationsListCellAgency({ agencyId, agencyName }: ValidationsListCellAgencyProps) {
	return (
		<div className={styles.wrapper}>
			<Tag label={agencyId} variant="secondary" />
			<Label>{agencyName}</Label>
		</div>
	);
}
