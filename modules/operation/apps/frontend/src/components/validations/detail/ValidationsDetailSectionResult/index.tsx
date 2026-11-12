'use client';

import { useValidationsDetailContext } from '@/components/validations/detail/ValidationsDetailForm.context';
import { getGtfsScheduleDocUrl } from '@/lib/gtfs-schedule-doc-url';
import { filterGroupsBySeverity, normalizeValidationMessageGroups } from '@/lib/gtfs-validation-message-groups';
import { type SeverityStatus } from '@tmlmobilidade/go-types-shared';
import { Collapsible, Divider, GtfsValidationResultGroup, NoDataLabel, Section, SeverityTag } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function ValidationsDetailSectionResult() {
	//

	//
	// A. Setup variables

	const validationsDetailContext = useValidationsDetailContext();
	const { t } = useTranslation();
	const [selectedSeverity, setSelectedSeverity] = useState<Exclude<SeverityStatus, 'ignore'> | null>(null);

	//
	// B. Transform data

	// Normalize older flat reports before counting or filtering their findings.
	const groups = useMemo(() => {
		const messages = validationsDetailContext.data.validation?.summary?.messages ?? [];
		return normalizeValidationMessageGroups(messages).filter(group => group.severity !== 'ignore');
	}, [validationsDetailContext.data.validation]);

	const severityCountLabels = useMemo(() => {
		const summary = validationsDetailContext.data.validation?.summary;
		const totalErrors = summary?.total_errors ?? 0;
		const totalWarnings = summary?.total_warnings ?? 0;
		const totalInfo = groups.reduce((count, group) => count + group.messages.filter(message => message.severity === 'info').length, 0);

		return {
			error: totalErrors === 1 ? `${totalErrors} Erro` : `${totalErrors} Erros`,
			info: `${totalInfo} ${t('shared:components.tags.SeverityTag.info.label')}`,
			warning: totalWarnings === 1 ? `${totalWarnings} Aviso` : `${totalWarnings} Avisos`,
		};
	}, [groups, t, validationsDetailContext.data.validation]);

	const messageGroups = useMemo(() => filterGroupsBySeverity(groups, selectedSeverity), [groups, selectedSeverity]);

	//
	// C. Render components

	if (validationsDetailContext.data.validation?.processing_status !== 'complete' && validationsDetailContext.data.validation?.processing_status !== 'error') {
		return null;
	}

	return (
		<Collapsible
			defaultOpen={true}
			description="Informações, avisos e erros encontrados no arquivo GTFS"
			title="Resultado da Validação"
		>
			<Section flexDirection="row" gap="md">
				<SeverityTag
					dimmed={selectedSeverity !== null && selectedSeverity !== 'error'}
					label={severityCountLabels.error}
					onClick={() => setSelectedSeverity(prev => prev === 'error' ? null : 'error')}
					selected={selectedSeverity === 'error'}
					severity="error"
				/>
				<SeverityTag
					dimmed={selectedSeverity !== null && selectedSeverity !== 'warning'}
					label={severityCountLabels.warning}
					onClick={() => setSelectedSeverity(prev => prev === 'warning' ? null : 'warning')}
					selected={selectedSeverity === 'warning'}
					severity="warning"
				/>
				<SeverityTag
					dimmed={selectedSeverity !== null && selectedSeverity !== 'info'}
					label={severityCountLabels.info}
					onClick={() => setSelectedSeverity(prev => prev === 'info' ? null : 'info')}
					selected={selectedSeverity === 'info'}
					severity="info"
				/>
			</Section>
			<Divider />
			<div>
				{messageGroups.length === 0
					? <NoDataLabel text="Sem resultados para mostrar" />
					: messageGroups.map(group => (
						<GtfsValidationResultGroup key={`${group.file_name}::${group.rule_id}`} getRuleDocumentationUrl={getGtfsScheduleDocUrl} group={group} />
					))}
			</div>
		</Collapsible>
	);

	//
}
