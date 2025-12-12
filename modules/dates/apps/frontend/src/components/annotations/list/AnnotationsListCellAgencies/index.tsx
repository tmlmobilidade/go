/* * */

import { Tag } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface AnnotationsListCellAgenciesProps {
	agencyIds: string[]
}

/* * */

export function AnnotationsListCellAgencies({ agencyIds }: AnnotationsListCellAgenciesProps) {
	return (
		<div className={styles.wrapper}>
			{agencyIds.map(agencyId => (
				<Tag key={agencyId} label={agencyId} />
			))}
		</div>
	);
}
