'use client';

import { usePeriodDatesEditorContext } from '@/components/year-periods/date-management/PeriodDatesEditor.context';
import { usePeriodsDetailContext } from '@/components/year-periods/detail/PeriodsDetail.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, CloseButton, IdTag, Label, Section, Spacer, Text, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import styles from './styles.module.css';

/* * */

export function PeriodDatesEditorHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const periodsDetailContext = usePeriodsDetailContext();
	const editorContext = usePeriodDatesEditorContext();
	const period = periodsDetailContext.data.period;

	//
	// B. Handle actions

	const handleClose = () => {
		if (!period) return;
		router.push(keepUrlParams(PAGE_ROUTES.dates.YEAR_PERIODS_DETAIL(period._id)));
	};

	//
	// C. Render components

	if (!period) return null;

	return (
		<Toolbar>
			<CloseButton onClick={handleClose} type="close" />
			<IdTag id={period._id} copyOnClick />
			<Section className={styles.title} gap={null} padding="none" width="max-content">
				<Label size="lg">Gerir datas</Label>
				<Text c="dimmed" size="sm">{period.name}</Text>
			</Section>
			<Spacer />
			<Button
				disabled={!editorContext.flags.has_changes || editorContext.flags.is_saving}
				label="Limpar alterações"
				onClick={editorContext.actions.resetChanges}
				variant="muted"
			/>
		</Toolbar>
	);

	//
}
