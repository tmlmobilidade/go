'use client';

import { usePeriodDatesEditorContext } from '@/components/year-periods/date-management/PeriodDatesEditor.context';
import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react';
import { Alert, Button, Section, Text } from '@tmlmobilidade/ui';
import { type ReactNode } from 'react';

import styles from './styles.module.css';

/* * */

export function PeriodDatesEditorConflict() {
	//

	//
	// A. Setup variables

	const editorContext = usePeriodDatesEditorContext();

	//
	// B. Render components

	let content: ReactNode = null;

	if (editorContext.flags.is_checking_conflicts) {
		content = (
			<Alert color="var(--color-primary)" icon={<IconLoader2 />} title="A verificar conflitos" variant="light" w="100%">
				<Text size="sm">A confirmar se as datas selecionadas já pertencem a outro período.</Text>
			</Alert>
		);
	} else if (editorContext.data.conflictError) {
		content = (
			<Alert color="var(--color-status-danger-primary)" icon={<IconAlertTriangle />} title="Não foi possível verificar conflitos" variant="light" w="100%">
				<Text size="sm">{editorContext.data.conflictError}</Text>
			</Alert>
		);
	} else if (editorContext.data.conflictWarning) {
		content = (
			<Alert color="var(--color-status-warning-primary)" icon={<IconAlertTriangle />} title="Datas atribuídas a outro período" variant="light" w="100%">
				<Section gap="sm" padding="none">
					<Text size="sm">{editorContext.data.conflictWarning}. Ao guardar, estas datas serão transferidas para este período.</Text>
					{!editorContext.flags.conflict_acknowledged && (
						<Button label="Compreendo e quero continuar" onClick={editorContext.actions.acknowledgeConflicts} />
					)}
					{editorContext.flags.conflict_acknowledged && <Text size="sm" weight="semibold">Transferência confirmada.</Text>}
				</Section>
			</Alert>
		);
	}

	if (!content) return null;

	return (
		<div className={styles.root}>
			{content}
		</div>
	);

	//
}
