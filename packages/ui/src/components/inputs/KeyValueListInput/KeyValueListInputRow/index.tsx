'use client';

import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from '../styles.module.css';

import { IconButton } from '../../../../buttons/IconButton';
import { TextInput } from '../../TextInput';
import { type KeyValueListInputRowProps } from '../types';

/* * */

export function KeyValueListInputRow({ ariaLabel, index, onChange, onRemove, readOnly, value, valueLabel }: KeyValueListInputRowProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const prefix = ariaLabel ? `${ariaLabel}: ` : '';

	//
	// B. Render components

	return (
		<div className={styles.row} data-read-only={readOnly}>
			<TextInput
				aria-label={`${prefix}${t('shared:components.inputs.KeyValueListInput.key')} ${index + 1}`}
				onChange={event => onChange({ ...value, key: event.currentTarget.value })}
				placeholder={t('shared:components.inputs.KeyValueListInput.key')}
				readOnly={readOnly}
				size="xs"
				value={value.key ?? ''}
			/>
			<span aria-hidden="true" className={styles.separator}>=</span>
			<TextInput
				aria-label={`${prefix}${valueLabel} ${index + 1}`}
				onChange={event => onChange({ ...value, value: event.currentTarget.value })}
				placeholder={valueLabel}
				readOnly={readOnly}
				size="xs"
				value={value.value ?? ''}
			/>
			{!readOnly && <IconButton icon={<IconX size={14} />} onClick={onRemove} tooltip={`${t('shared:components.inputs.KeyValueListInput.remove')} ${index + 1}`} variant="subtle" />}
		</div>
	);
}
