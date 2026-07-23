/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';

import styles from './styles.module.css';

import { useDataAgencies } from '../../../hooks/use-data/use-data-agencies';
import { Label } from '../../display/Label';
import { IdTag } from '../IdTag';
import { Tag } from '../Tag';

/* * */

interface AgencyTagProps {
	agencyId: string
	copyOnClick?: boolean
	showCode?: boolean
	showId?: boolean
	showName?: boolean
	showShortName?: boolean
}

/* * */

export function AgencyTag({ agencyId, copyOnClick = true, showCode = true, showId = true, showName = false, showShortName = false }: AgencyTagProps) {
	//

	//
	// A. Fetch data

	const { raw: agenciesData } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST);

	//
	// B. Transform data

	const agencyData = agenciesData.find(agency => agency._id === agencyId);
	const agencyCode = agencyData?.code;
	const agencyName = agencyData?.name;
	const agencyShortName = agencyData?.short_name;

	//
	// C. Render components

	return (
		<div className={styles.wrapper}>
			{showId && <IdTag copyOnClick={copyOnClick} id={agencyId} />}
			{showCode && <Tag label={agencyCode} variant="secondary" />}
			{showName && agencyCode && <Label>{agencyName}</Label>}
			{showShortName && agencyShortName && <Label>{agencyShortName}</Label>}
		</div>
	);
}
