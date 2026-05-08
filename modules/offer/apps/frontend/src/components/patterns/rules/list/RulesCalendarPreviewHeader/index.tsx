'use client';

import { CloseButton, Tag, Toolbar } from '@tmlmobilidade/ui';

import { closeRulesCalendarPreviewModal } from '../RulesCalendarPreview.modal';

/* * */

export function RulesCalendarPreviewHeader({ patternCode }: { patternCode: string }) {
	//

	//
	// A. Setup variables

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeRulesCalendarPreviewModal} type="close" />
			<Tag label="Prever calendário" variant="muted" />
			<Tag label={patternCode} variant="muted" />
		</Toolbar>
	);

	//
}
