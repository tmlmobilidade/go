/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';

import styles from './styles.module.css';

import { useDataAgencies } from '../../../hooks/use-data-agencies';
import { Label } from '../../display/Label';
import { Tag } from '../Tag';

/* * */

interface AgencyTagProps {
	agencyId: string
	showId?: boolean
	showName?: boolean
}

/* * */

export function AgencyTag({ agencyId, showId = true, showName = false }: AgencyTagProps) {
	//

	//
	// A. Fetch data

	const { raw: agenciesData } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST);

	//
	// B. Transform data

	const agencyName = agenciesData.find(agency => agency._id === agencyId)?.name;

	//
	// C. Render components

	return (
		<div className={styles.wrapper}>
			{showId && <Tag label={agencyId} variant="secondary" />}
			{showName && agencyName && <Label>{agencyName}</Label>}
		</div>
	);
}
