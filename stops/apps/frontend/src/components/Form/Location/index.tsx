'use client';

import { StopsListViewMap } from '@/components/Stop/StopMap';
import React from 'react';

import { Coords } from '../Coords';
import styles from './styles.module.css';

export function Location({ data, getStopById }) {
	//

	//
	// A. Render components
	return (
		<div className={styles.container}>
			<StopsListViewMap getStopById={getStopById} />
			<Coords latitude={data.form.getValues().latitude} longitude={data.form.getValues().longitude} municipality="Lisboa" />
		</div>
	);
}
