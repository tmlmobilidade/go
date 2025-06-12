'use client';

import { StopsListViewMap } from '@/components/Stop/StopMap';
import { useStopsDetailContext } from '@/contexts/StopsDetail.context';
import React from 'react';

import { Coords } from '../Coords';
import styles from './styles.module.css';

export function Location({ municipality }) {
	//

	const stopDetailsContext = useStopsDetailContext();

	//
	// A. Render components
	return (
		<div className={styles.container}>
			<StopsListViewMap isCreateAction={true} />
			<Coords latitude={stopDetailsContext.data.form.getValues().latitude} longitude={stopDetailsContext.data.form.getValues().longitude} municipality={municipality} municipality_id={stopDetailsContext.data.form.getValues().municipality_id} />
		</div>
	);
}
