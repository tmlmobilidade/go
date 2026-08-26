'use client';

import { Collapsible } from '@tmlmobilidade/ui';

import { AlertsDetailSectionTextsAi } from '../AlertsDetailSectionTextsAi';
import { AlertsDetailSectionTextsForm } from '../AlertsDetailSectionTextsForm';

/* * */

export function AlertsDetailSectionTexts() {
	return (
		<Collapsible
			description="Breve descrição do que motivou a criação do alerta"
			title="Título e Descrição"
			defaultOpen
		>
			<AlertsDetailSectionTextsAi />
			<AlertsDetailSectionTextsForm />
		</Collapsible>
	);
}
