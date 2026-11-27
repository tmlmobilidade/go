'use client';

import { type GtfsValidationRuleModifier } from '@tmlmobilidade/go-types-gtfs-validator';
import { useCallback, useMemo, useState } from 'react';

import { useAgenciesDetailValidationRulesContext } from '../AgenciesDetailValidationRules.context';

/* * */

interface UseAgenciesDetailValidationRuleModifierReturnType {
	canEdit: boolean
	hasConflictingModifiers: boolean
	isReplacingModifier: boolean
	modifier?: GtfsValidationRuleModifier
	setModifier: (modifier?: GtfsValidationRuleModifier) => void
	setType: (type: null | string) => void
}

/* * */

export function useAgenciesDetailValidationRuleModifier(): UseAgenciesDetailValidationRuleModifierReturnType {
	//

	//
	// A. Setup variables

	const { actions: { updateRule }, data: { selectedEntry, selectedRule }, flags } = useAgenciesDetailValidationRulesContext();
	const [draftType, setDraftType] = useState<GtfsValidationRuleModifier['type']>();
	const ruleId = selectedEntry?.ruleId;
	const canEdit = flags.can_edit && !!selectedEntry?.severity;
	const { compare, modifiers, options } = selectedRule ?? {};
	const hasConflictingModifiers = compare !== undefined && options !== undefined;
	const isChoosingType = canEdit && draftType !== undefined;
	const modifier: GtfsValidationRuleModifier | undefined = isChoosingType ? { type: draftType, values: [] } : modifiers;

	//
	// B. Handle actions

	const setModifier = useCallback((next?: GtfsValidationRuleModifier) => {
		if (!canEdit || !ruleId) return;
		setDraftType(undefined);
		updateRule(ruleId, rule => rule?.severity && ({
			depends_on: rule.depends_on ?? [],
			modifiers: next,
			rule_id: ruleId,
			severity: rule.severity,
		}));
	}, [canEdit, ruleId, updateRule]);

	const setType = useCallback((type: null | string) => {
		if (!canEdit) return;
		if (type === 'none') {
			if (modifiers) setModifier();
			else setDraftType(undefined);
			return;
		}
		if (type !== 'compare' && type !== 'options') return;
		if (hasConflictingModifiers) {
			setModifier(type === 'compare' ? { type, values: compare } : { type, values: options });
			return;
		}
		setDraftType(type === modifiers?.type ? undefined : type);
	}, [canEdit, compare, hasConflictingModifiers, modifiers, options, setModifier]);

	//
	// C. Return state

	return useMemo(() => ({
		canEdit,
		hasConflictingModifiers,
		isReplacingModifier: isChoosingType && modifiers !== undefined,
		modifier,
		setModifier,
		setType,
	}), [canEdit, hasConflictingModifiers, isChoosingType, modifier, modifiers, setModifier, setType]);
}
