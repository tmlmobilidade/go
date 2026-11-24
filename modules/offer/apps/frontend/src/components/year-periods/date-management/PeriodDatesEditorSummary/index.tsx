'use client';

import { usePeriodDatesEditorContext } from '@/components/year-periods/date-management/PeriodDatesEditor.context';
import { usePeriodsDetailFormContext } from '@/components/year-periods/detail/PeriodsDetailForm.context';
import { PeriodsAssignmentReview } from '@/components/year-periods/shared/PeriodsAssignmentReview';
import { Button, Label, Section, Spacer, Text, Toolbar } from '@tmlmobilidade/ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function PeriodDatesEditorSummary() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const editor = usePeriodDatesEditorContext();
	const { cancelSelection } = editor.actions;
	const form = usePeriodsDetailFormContext();
	const isSelecting = !!editor.data.selectedRange && !editor.data.selectedRange.end;
	const readOnly = editor.flags.is_permission_restricted || editor.flags.is_locked;
	const busy = !!form.status.isUpdating || !!form.status.isDeleting || !!form.status.isLocking;

	//
	// B. Handle actions

	useEffect(() => {
		if (!isSelecting || busy) return;
		const cancel = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return;
			event.preventDefault();
			cancelSelection();
		};
		window.addEventListener('keydown', cancel, true);
		return () => window.removeEventListener('keydown', cancel, true);
	}, [busy, cancelSelection, isSelecting]);

	const discard = () => {
		if (busy) return;
		editor.actions.resetChanges();
		form.form.reset();
	};

	//
	// C. Render components

	return (
		<>
			{(form.assignmentReview.isChecking || form.assignmentReview.error || form.assignmentReview.conflicts.length > 0) && (
				<Section gap="sm" padding="sm">
					<PeriodsAssignmentReview disabled={busy} review={form.assignmentReview} />
				</Section>
			)}
			<Toolbar>
				<Section className={styles.summary} gap="xs" padding="none" width="max-content">
					<Label>{readOnly ? t('default:periods.calendar.readOnly') : editor.flags.has_changes ? t('default:periods.calendar.changes', { added: editor.data.addedDates.length, removed: editor.data.removedDates.length }) : t(form.isDirty ? 'default:periods.calendar.settingsChanged' : 'default:periods.calendar.noChanges')}</Label>
					{!readOnly && <Text c="dimmed" size="sm">{t(isSelecting ? 'default:periods.calendar.selectEnd' : 'default:periods.calendar.selectRange')}</Text>}
				</Section>
				<Spacer />
				{isSelecting && <Button disabled={busy} label={t('default:periods.calendar.cancelSelection')} onClick={cancelSelection} variant="muted" />}
				{form.isDirty && <Button disabled={busy} label={t('default:periods.calendar.discardChanges')} onClick={discard} variant="muted" />}
			</Toolbar>
		</>
	);
}
