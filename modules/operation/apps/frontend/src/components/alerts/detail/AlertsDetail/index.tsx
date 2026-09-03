'use client';

import { Pane } from '@tmlmobilidade/ui';

import { AlertsDetailFootnote } from '../AlertsDetailFootnote';
import { AlertsDetailHeader } from '../AlertsDetailHeader';
import { AlertsDetailSectionCauseEffect } from '../AlertsDetailSectionCauseEffect';
import { AlertsDetailSectionDates } from '../AlertsDetailSectionDates';
import { AlertsDetailSectionReferences } from '../AlertsDetailSectionReferences';
import { AlertsDetailSectionTexts } from '../AlertsDetailSectionTexts';

/* * */

export function AlertsDetail() {
	return (
		<Pane header={[<AlertsDetailHeader key="header" />]}>
			<AlertsDetailSectionTexts />
			<AlertsDetailSectionDates />
			<AlertsDetailSectionCauseEffect />
			<AlertsDetailSectionReferences />
			<AlertsDetailFootnote />
		</Pane>
	);
}
