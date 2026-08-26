/* * */

import { type Agency } from '@tmlmobilidade/go-types-core';
import { useMemo } from 'react';

import styles from './styles.module.css';

import { Label } from '../../display/Label';
import { IdTag } from '../IdTag';
import { Tag } from '../Tag';

/* * */

interface AgencyTagProps {
	agencyId: string
	copyOnClick?: boolean
	data: Partial<Pick<Agency, '_id' | 'code' | 'name' | 'short_name'>>[]
	showCode?: boolean
	showId?: boolean
	showName?: boolean
	showShortName?: boolean
}

/* * */

export function AgencyTag({ agencyId, copyOnClick = true, data = [], showCode = true, showId = true, showName = false, showShortName = false }: AgencyTagProps) {
	//

	//
	// A. Transform data

	const matchingAgency = useMemo(() => {
		return data?.find(agency => agency._id === agencyId);
	}, [data, agencyId]);

	//
	// B. Render components

	return (
		<div className={styles.wrapper}>
			{showId && <IdTag copyOnClick={copyOnClick} id={agencyId} />}
			{showCode && <Tag label={matchingAgency?.code} variant="secondary" />}
			{showName && matchingAgency?.name && <Label>{matchingAgency?.name}</Label>}
			{showShortName && matchingAgency?.short_name && <Label>{matchingAgency?.short_name}</Label>}
		</div>
	);
}
