'use client';

import { AlertsDetailFootnote } from '@/components/detail/AlertsDetailFootnote';
import { AlertsDetailHeader } from '@/components/detail/AlertsDetailHeader';
import { AlertsDetailSectionCauseEffect } from '@/components/detail/AlertsDetailSectionCauseEffect';
import { AlertsDetailSectionDates } from '@/components/detail/AlertsDetailSectionDates';
import { AlertsDetailSectionReferences } from '@/components/detail/AlertsDetailSectionReferences';
import { AlertsDetailSectionTexts } from '@/components/detail/AlertsDetailSectionTexts';
import { Pane } from '@tmlmobilidade/ui';

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
