'use client';

/* * */

import { Pane } from '@tmlmobilidade/ui';

import { AdministratorInfo } from './AdministratorInfo';
import { Allocation } from './Allocation';
import { StopDetails } from './Stopdetails';

/* * */

export function FormInfos() {
	return (
		<Pane>
			<StopDetails />
			<AdministratorInfo />
			<Allocation />
		</Pane>
	);
}
