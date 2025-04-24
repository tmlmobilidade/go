'use client';

import { Pane } from '@tmlmobilidade/ui';

import { ValidationDetailHeader } from '../ValidationDetailHeader';
import { ValidationDetailSectionFiles } from '../ValidationDetailSectionFiles';
import { ValidationDetailSectionInfo } from '../ValidationDetailSectionInfo';

/* * */

export function ValidationDetail() {
	//

	//
	// A. Render components
	return (
		<Pane header={[<ValidationDetailHeader />]}>
			<ValidationDetailSectionInfo />
			<ValidationDetailSectionFiles />
		</Pane>
	);
}
