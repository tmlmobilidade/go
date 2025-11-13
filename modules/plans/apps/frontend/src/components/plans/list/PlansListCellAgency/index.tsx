/* * */

import { Label, Tag } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface PlansListCellAgencyProps {
	agencyId: string
	agencyName: string
}

/* * */

export function PlansListCellAgency({ agencyId, agencyName }: PlansListCellAgencyProps) {
	return (
		<div className={styles.wrapper}>
			<Tag label={agencyId} variant="secondary" />
			<Label>{agencyName}</Label>
		</div>
	);
}
