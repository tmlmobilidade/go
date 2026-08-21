/* * */

import { AgenciesPlatformRequest } from '@tmlmobilidade/go-types-core';
import { type ScopeActions } from '@tmlmobilidade/go-types-permissions';

import styles from './styles.module.css';

import { useAgenciesData } from '../../../data';
import { Label } from '../../display/Label';
import { IdTag } from '../IdTag';
import { Tag } from '../Tag';

/* * */

interface AgencyTagProps {
	agencyId: string
	copyOnClick?: boolean
	permissions: ScopeActions
	showCode?: boolean
	showId?: boolean
	showName?: boolean
	showShortName?: boolean
}

/* * */

export function AgencyTag({ agencyId, copyOnClick = true, permissions, showCode = true, showId = true, showName = false, showShortName = false }: AgencyTagProps) {
	//

	//
	// A. Fetch data

	const { data } = useAgenciesData(permissions as AgenciesPlatformRequest);

	//
	// B. Transform data

	const agencyData = data.find(agency => agency._id === agencyId);
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
