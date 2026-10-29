'use client';

import { Checkbox, ScrollArea, Text } from '@mantine/core';
import { useState } from 'react';

import styles from './styles.module.css';

import { type SelectDataItem } from '../../../components/inputs/Select';
import { SelectOption } from '../../../components/inputs/SelectOption';

/* * */

interface ListFilterOptionsProps {
	emptyMessage: string
	onSelect: (option: SelectDataItem) => void
	options: SelectDataItem[]
}

const PAGE_SIZE = 50;

/* * */

export function ListFilterOptions({ emptyMessage, onSelect, options }: ListFilterOptionsProps) {
	//

	//
	// A. Setup variables

	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

	//
	// B. Render components

	return (
		<ScrollArea.Autosize
			mah={320}
			offsetScrollbars="y"
			onBottomReached={() => setVisibleCount(count => count < options.length ? Math.min(count + PAGE_SIZE, options.length) : count)}
			scrollbars="y"
			type="auto"
		>
			<div className={styles.container}>
				{options.length === 0 && <Text c="dimmed" role="status" size="sm">{emptyMessage}</Text>}
				{options.slice(0, visibleCount).map(option => (
					<Checkbox
						key={option.value}
						checked={!!option.checked}
						disabled={option.disabled}
						label={<SelectOption option={option} />}
						onChange={() => onSelect(option)}
						value={option.value}
					/>
				))}
			</div>
		</ScrollArea.Autosize>
	);
}
