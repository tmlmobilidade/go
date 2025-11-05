/* eslint-disable @typescript-eslint/no-explicit-any */

/* * */

import { ScopeEntityMap, ScopeKey } from '@/contexts/ProposedChanges.context';
import { CreateProposedChangeDto, ProposedChange } from '@tmlmobilidade/types';
import React, { useEffect, useId, useState } from 'react';

/* * */

interface ProposedChangesClonedInputProps<S extends ScopeKey> {
	originalInput: React.ReactElement<any>
	proposedChangeData?: ProposedChange<ScopeEntityMap[S]>
	setProposedChange: (value: CreateProposedChangeDto<ScopeEntityMap[S]> | undefined) => void
}

/* * */

export function ProposedChangesClonedInput<S extends ScopeKey>({ originalInput, proposedChangeData, setProposedChange }: ProposedChangesClonedInputProps<S>) {
	//

	//
	// A. Setup Variables

	const inputName = (originalInput.type as any)?.displayName || (originalInput.type as any)?.name || '';
	const lc = inputName.toLowerCase();

	const isCheckbox = lc.includes('checkbox') || lc.includes('switch');
	const isCombobox = lc.includes('combobox') || lc.includes('select');

	const ComponentType = originalInput.type as any;
	const baseProps = { ...originalInput.props };
	const uniqueKey = useId();
	const newProps: any = { ...baseProps, disabled: proposedChangeData ? true : baseProps.disabled, id: `${baseProps.id ?? inputName}-${uniqueKey}` };

	const [localValue, setLocalValue] = useState<any>(proposedChangeData?.curr_value ?? baseProps.defaultValue ?? '');

	//
	// B. Transform Data

	useEffect(() => {
		if (!proposedChangeData) return;
		setLocalValue(proposedChangeData.curr_value);
	}, [proposedChangeData]);

	if (isCheckbox) {
		newProps.defaultChecked = localValue || false;
		newProps.checked = localValue;
		newProps.onChange = (e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.currentTarget.checked);
	}
	else if (isCombobox) {
		newProps.value = localValue ?? '';
		newProps.onChange = (v: any) => handleChange(v);
	}
	else {
		newProps.value = localValue?.toString() ?? '';
		newProps.onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleChange(e.currentTarget.value);
	}

	//
	// C. Handle Actions

	const handleChange = (value: any) => {
		setLocalValue(value);
		setProposedChange({ ...proposedChangeData, curr_value: value } as CreateProposedChangeDto<ScopeEntityMap[S]>);
	};

	//
	// D. Render Components

	return <ComponentType key={uniqueKey} {...newProps} />;

	//
}
