'use client';

import { ValidationCreateBasicInfo } from '@/components/validations/create/ValidationCreateBasicInfo';
import { ValidationCreateHeader } from '@/components/validations/create/ValidationCreateHeader';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function ValidationCreate() {
	return (
		<Pane header={[<ValidationCreateHeader key="header" />]}>
			<ValidationCreateBasicInfo />
		</Pane>
	);
}
