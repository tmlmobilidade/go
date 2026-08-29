'use client';

import { AlertsDetailFootnote } from '@/components/alerts/detail/AlertsDetailFootnote';
import { AlertsDetailHeader } from '@/components/alerts/detail/AlertsDetailHeader';
import { AlertsDetailSectionCauseEffect } from '@/components/alerts/detail/AlertsDetailSectionCauseEffect';
import { AlertsDetailSectionDates } from '@/components/alerts/detail/AlertsDetailSectionDates';
import { AlertsDetailSectionReferences } from '@/components/alerts/detail/AlertsDetailSectionReferences';
import { AlertsDetailSectionTexts } from '@/components/alerts/detail/AlertsDetailSectionTexts';
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
