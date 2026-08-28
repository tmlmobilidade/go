'use client';

import { usePeriodDatesEditorContext } from '@/components/year-periods/date-management/PeriodDatesEditor.context';
import { Button, Label, Section, Spacer, Text, Toolbar } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function PeriodDatesEditorSummary() {
	//

	//
	// A. Setup variables

	const editorContext = usePeriodDatesEditorContext();
	const addedCount = editorContext.data.addedDates.length;
	const removedCount = editorContext.data.removedDates.length;
	const selectedCount = editorContext.data.selectedRangeDayCount;

	//
	// B. Transform data

	const changesLabel = editorContext.flags.has_changes
		? `${addedCount} ${addedCount === 1 ? 'data adicionada' : 'datas adicionadas'} · ${removedCount} ${removedCount === 1 ? 'data removida' : 'datas removidas'}`
		: 'Sem alterações pendentes';
	const selectedLabel = selectedCount > 0
		? `Último intervalo: ${selectedCount} ${selectedCount === 1 ? 'dia' : 'dias'}`
		: 'Selecione um intervalo no calendário';
	const saveStatus = editorContext.flags.is_checking_conflicts
		? 'A verificar conflitos...'
		: editorContext.data.conflictError ?? (editorContext.flags.conflict_acknowledged ? 'Transferência de datas confirmada' : null);

	//
	// C. Render components

	return (
		<Toolbar>
			<Section className={styles.summary} gap="xs" padding="none" width="max-content">
				<Label>{changesLabel}</Label>
				<Text c="dimmed" size="sm">{selectedLabel}</Text>
			</Section>
			<Spacer />
			{saveStatus && <Text c="dimmed" size="sm">{saveStatus}</Text>}
			<Button
				disabled={!editorContext.flags.can_save}
				label="Guardar alterações"
				loading={editorContext.flags.is_saving}
				onClick={editorContext.actions.saveChanges}
			/>
		</Toolbar>
	);

	//
}
