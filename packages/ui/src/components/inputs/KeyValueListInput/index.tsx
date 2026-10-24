'use client';

import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { Button } from '../../../buttons/Button';
import { Label } from '../../display/Label';
import { Section } from '../../layout/Section';
import { KeyValueListInputRow } from './KeyValueListInputRow';
import { type KeyValueListInputProps, type KeyValuePair } from './types';

/* * */

/**
 * Controlled list of editable key/value pairs, independent of any form or domain.
 */
export function KeyValueListInput({ ariaLabel, onChange, readOnly = false, value, valueLabel }: KeyValueListInputProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const resolvedValueLabel = valueLabel ?? t('shared:components.inputs.KeyValueListInput.value');

	//
	// B. Handle actions

	const handleChange = (index: number, pair: KeyValuePair) => {
		if (readOnly) return;
		onChange(value.map((current, pairIndex) => pairIndex === index ? pair : current));
	};

	const handleRemove = (index: number) => {
		if (readOnly) return;
		onChange(value.filter((_, pairIndex) => pairIndex !== index));
	};

	const handleAdd = () => {
		if (readOnly) return;
		onChange([...value, { key: '', value: '' }]);
	};

	//
	// C. Render components

	return (
		<Section gap="xs" padding="none">
			{value.length > 0 && (
				<div aria-hidden="true" className={`${styles.row} ${styles.header}`} data-read-only={readOnly}>
					<Label size="sm" variant="muted">{t('shared:components.inputs.KeyValueListInput.key')}</Label>
					<span className={styles.separator}>=</span>
					<Label size="sm" variant="muted">{resolvedValueLabel}</Label>
				</div>
			)}
			{value.map((pair, index) => (
				<KeyValueListInputRow
					key={index}
					ariaLabel={ariaLabel}
					index={index}
					onChange={pair => handleChange(index, pair)}
					onRemove={() => handleRemove(index)}
					readOnly={readOnly}
					value={pair}
					valueLabel={resolvedValueLabel}
				/>
			))}
			{!readOnly && (
				<div>
					<Button icon={<IconPlus size={14} />} label={t('shared:components.inputs.KeyValueListInput.add')} onClick={handleAdd} size="xs" variant="transparent" />
				</div>
			)}
		</Section>
	);
}
