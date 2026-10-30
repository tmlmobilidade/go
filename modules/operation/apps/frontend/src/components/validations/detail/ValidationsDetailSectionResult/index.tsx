'use client';

import { useValidationsDetailContext } from '@/components/validations/detail/ValidationsDetailForm.context';
import { getGtfsScheduleDocUrl } from '@/lib/gtfs-schedule-doc-url';
import { filterGroupsBySeverity, normalizeValidationMessageGroups } from '@/lib/gtfs-validation-message-groups';
import { Collapsible, Divider, GtfsValidationResultGroup, NoDataLabel, Section, SeverityTag } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';

/* * */

export function ValidationsDetailSectionResult() {
	//

	//
	// A. Setup variables

	const validationsDetailContext = useValidationsDetailContext();
	const [selectedSeverity, setSelectedSeverity] = useState<'error' | 'warning' | null>(null);

	//
	// B. Transform data

	const severityCountLabels = useMemo(() => {
		const summary = validationsDetailContext.data.validation?.summary;
		const totalErrors = summary?.total_errors ?? 0;
		const totalWarnings = summary?.total_warnings ?? 0;

		return {
			error: totalErrors === 1 ? `${totalErrors} Erro` : `${totalErrors} Erros`,
			warning: totalWarnings === 1 ? `${totalWarnings} Aviso` : `${totalWarnings} Avisos`,
		};
	}, [validationsDetailContext.data.validation]);

	// The validator already returns one entry per rule with its generic sentence;
	// normalizing only rebuilds the grouping for validations stored before that change
	const messageGroups = useMemo(() => {
		const messages = validationsDetailContext.data.validation?.summary?.messages ?? [];
		const groups = normalizeValidationMessageGroups(messages)
			.filter(group => group.severity !== 'ignore');

		return filterGroupsBySeverity(groups, selectedSeverity);
	}, [selectedSeverity, validationsDetailContext.data.validation]);

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
					dimmed={selectedSeverity === 'warning'}
					label={severityCountLabels.error}
					onClick={() => setSelectedSeverity(prev => prev === 'error' ? null : 'error')}
					selected={selectedSeverity === 'error'}
					severity="error"
				/>
				<SeverityTag
					dimmed={selectedSeverity === 'error'}
					label={severityCountLabels.warning}
					onClick={() => setSelectedSeverity(prev => prev === 'warning' ? null : 'warning')}
					selected={selectedSeverity === 'warning'}
					severity="warning"
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
