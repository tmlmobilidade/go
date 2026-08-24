/* * */

import { type AgenciesPlatformRequest } from '@tmlmobilidade/go-types-core';
import { useMemo } from 'react';

import styles from './styles.module.css';

import { useAgenciesData } from '../../../data';
import { Label } from '../../display/Label';
import { IdTag } from '../IdTag';
import { Tag } from '../Tag';

/* * */

interface AgencyTagProps {
	agencyId: string
	copyOnClick?: boolean
	request: AgenciesPlatformRequest
	showCode?: boolean
	showId?: boolean
	showName?: boolean
	showShortName?: boolean
}

/* * */

export function AgencyTag({ agencyId, copyOnClick = true, request, showCode = true, showId = true, showName = false, showShortName = false }: AgencyTagProps) {
	//

	//
	// A. Fetch data

	const { data } = useAgenciesData(request);

	//
	// B. Transform data

	const matchingAgency = useMemo(() => {
		return data.find(agency => agency._id === agencyId);
	}, [data, agencyId]);

	//
	// C. Render components

	return (
		<div className={styles.wrapper}>
			{showId && <IdTag copyOnClick={copyOnClick} id={agencyId} />}
			{showCode && <Tag label={matchingAgency?.code} variant="secondary" />}
			{showName && matchingAgency?.name && <Label>{matchingAgency?.name}</Label>}
			{showShortName && matchingAgency?.short_name && <Label>{matchingAgency?.short_name}</Label>}
		</div>
	);
}
