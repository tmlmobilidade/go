'use client';

import { openCreateRuleModal } from '@/components/patterns/rules/create/RuleCreate.modal';
import { openRulesCalendarPreviewModal } from '@/components/patterns/rules/list/RulesCalendarPreview.modal';
import { openCreateParameterModal } from '@/components/patterns/shape/parameters/create/ParameterCreate.modal';
import { type PatternsDetailFormDto, type PatternsDetailPathItem } from '@tmlmobilidade/go-offer-pckg-types';
import { type ManualRule, type ScheduleRule, type StopsParameter } from '@tmlmobilidade/go-types-offer';
import { generateRandomString } from '@tmlmobilidade/strings';
import { type UseStandardFormReturnType } from '@tmlmobilidade/ui';
import { type RefObject, useCallback, useMemo } from 'react';

/* * */

interface UsePatternsDetailSchedulingActionsOptions {
	accessRef: RefObject<{ editEnabled: boolean, patternId: string }>
	agencyId: string | undefined
	form: UseStandardFormReturnType<PatternsDetailFormDto>['form']
	patternId: string
	persistedPath: PatternsDetailPathItem[] | undefined
	rulesForUI: ScheduleRule[]
}

interface UsePatternsDetailSchedulingActionsReturnType {
	handleAddRule: (rule: ManualRule) => void
	handleDeleteRule: (ruleId: string) => void
	handleDuplicateRule: (rule: ManualRule) => void
	handleEditRule: (rule: ManualRule) => void
	handleOpenRuleModal: (rule?: ManualRule) => void
	handleOpenRulesCalendarPreviewModal: () => void
	handleOpenStopsParameterModal: (rule?: StopsParameter) => void
}

/* * */

/**
 * Edit scheduling collections in the parent form; these actions never persist to the API.
 * Read the latest collection on submit, and check live access plus Pattern identity both when
 * opening a dialog and when its delayed callback runs. The parent owns dialog cleanup.
 */
export function usePatternsDetailSchedulingActions({ accessRef, agencyId, form, patternId, persistedPath, rulesForUI }: UsePatternsDetailSchedulingActionsOptions): UsePatternsDetailSchedulingActionsReturnType {
	//
	// A. Edit manual rules and open previews

	const handleAddRule = useCallback((rule: ManualRule) => {
		if (!accessRef.current.editEnabled || accessRef.current.patternId !== patternId) return;
		const currentRules = (form.getValues().rules ?? []) as ManualRule[];
		const ruleWithId = { ...rule, _id: generateRandomString({ length: 5 }) };
		const newRules = [...currentRules, ruleWithId];

		form.setValue('rules', newRules, { shouldDirty: true, shouldValidate: true });
	}, [accessRef, form, patternId]);

	const handleEditRule = useCallback((rule: ManualRule) => {
		if (!accessRef.current.editEnabled || accessRef.current.patternId !== patternId) return;
		if (!rule._id) {
			return;
		}
		const currentRules = (form.getValues().rules ?? []) as ManualRule[];
		const newRules = currentRules.map(r =>
			r._id === rule._id ? rule : r,
		);

		form.setValue('rules', newRules, { shouldDirty: true, shouldValidate: true });
	}, [accessRef, form, patternId]);

	const handleDeleteRule = useCallback((ruleId: string) => {
		if (!accessRef.current.editEnabled || accessRef.current.patternId !== patternId) return;
		const currentRules = (form.getValues().rules ?? []) as ManualRule[];
		const newRules = currentRules.filter(r => r._id !== ruleId);

		form.setValue('rules', newRules, { shouldDirty: true, shouldValidate: true });
	}, [accessRef, form, patternId]);

	const handleDuplicateRule = useCallback((rule: ManualRule) => {
		if (!accessRef.current.editEnabled || accessRef.current.patternId !== patternId) return;
		const currentRules = (form.getValues().rules ?? []) as ManualRule[];
		const manualRule = { ...rule } as ManualRule & { tooltip?: string };
		delete manualRule.tooltip;
		const duplicatedRule = { ...manualRule, _id: generateRandomString({ length: 5 }) };
		const newRules = [...currentRules, duplicatedRule];

		form.setValue('rules', newRules, { shouldDirty: true, shouldValidate: true });
	}, [accessRef, form, patternId]);

	const handleOpenRuleModal = useCallback((rule?: ManualRule) => {
		if (!accessRef.current.editEnabled || accessRef.current.patternId !== patternId) return;
		const onSubmit = (validatedRule: ManualRule) => {
			if (rule?._id) {
				// Editing - preserve the _id
				handleEditRule({ ...validatedRule, _id: rule._id });
			} else {
				// Creating new
				handleAddRule(validatedRule);
			}
		};

		const onDelete = rule?._id ? () => handleDeleteRule(rule._id) : undefined;
		const onDuplicate = rule?._id ? (duplicatedRule: ManualRule) => handleDuplicateRule(duplicatedRule) : undefined;

		openCreateRuleModal(agencyId || '', onSubmit, rule, onDelete, onDuplicate);
	}, [accessRef, handleAddRule, handleEditRule, handleDeleteRule, handleDuplicateRule, agencyId, patternId]);

	const handleOpenRulesCalendarPreviewModal = useCallback(() => {
		openRulesCalendarPreviewModal(
			agencyId || '',
			rulesForUI,
		);
	}, [agencyId, rulesForUI]);

	//
	// B. Edit travel-time parameters

	const handleAddStopParameter = useCallback((rule: StopsParameter) => {
		if (!accessRef.current.editEnabled || accessRef.current.patternId !== patternId) return;
		const currentRules = (form.getValues().parameters ?? []) as StopsParameter[];
		const ruleWithId = { ...rule, _id: generateRandomString({ length: 5 }) };
		const newRules = [...currentRules, ruleWithId];

		form.setValue('parameters', newRules, { shouldDirty: true, shouldValidate: true });
	}, [accessRef, form, patternId]);

	const handleEditStopParameter = useCallback((rule: StopsParameter) => {
		if (!accessRef.current.editEnabled || accessRef.current.patternId !== patternId) return;
		if (!rule._id) {
			return;
		}
		const currentRules = (form.getValues().parameters ?? []) as StopsParameter[];
		const newRules = currentRules.map(r =>
			r._id === rule._id ? rule : r,
		);

		form.setValue('parameters', newRules, { shouldDirty: true, shouldValidate: true });
	}, [accessRef, form, patternId]);

	const handleDeleteStopParameter = useCallback((ruleId: string) => {
		if (!accessRef.current.editEnabled || accessRef.current.patternId !== patternId) return;
		const currentRules = (form.getValues().parameters ?? []) as StopsParameter[];
		const newRules = currentRules.filter(r => r._id !== ruleId);

		form.setValue('parameters', newRules, { shouldDirty: true, shouldValidate: true });
	}, [accessRef, form, patternId]);

	const handleOpenStopsParameterModal = useCallback((rule?: StopsParameter) => {
		if (!accessRef.current.editEnabled || accessRef.current.patternId !== patternId) return;
		const onSubmit = (validatedRule: StopsParameter) => {
			if (rule?._id) {
				// Editing - preserve the _id
				handleEditStopParameter({ ...validatedRule, _id: rule._id });
			} else {
				// Creating new
				handleAddStopParameter(validatedRule);
			}
		};

		const onDelete = rule?._id ? () => handleDeleteStopParameter(rule._id) : undefined;

		const defaultParameter = (form.getValues().parameters ?? []).find((p): p is StopsParameter => p.kind === 'default');
		openCreateParameterModal(agencyId || '', onSubmit, (form.getValues().path ?? persistedPath) as PatternsDetailPathItem[], rule, onDelete, defaultParameter);
	}, [accessRef, agencyId, persistedPath, handleEditStopParameter, handleAddStopParameter, handleDeleteStopParameter, form, patternId]);

	//
	// C. Return scheduling actions

	return useMemo(() => ({
		handleAddRule,
		handleDeleteRule,
		handleDuplicateRule,
		handleEditRule,
		handleOpenRuleModal,
		handleOpenRulesCalendarPreviewModal,
		handleOpenStopsParameterModal,
	}), [handleAddRule, handleDeleteRule, handleDuplicateRule, handleEditRule, handleOpenRuleModal, handleOpenRulesCalendarPreviewModal, handleOpenStopsParameterModal]);
}
