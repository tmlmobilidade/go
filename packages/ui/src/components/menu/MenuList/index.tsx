'use client';

/* * */

import { createElement, type Key, useMemo, useState } from 'react';

import styles from './styles.module.css';

import { Label } from '../../display/Label';
import { Section } from '../../layout/Section';

/* * */

interface MenuListProps<T> {
	data: T[]
	getItemKey: (item: T, index: number) => Key
	itemComponent: React.ComponentType<{ item: T }>
	maxDisplayedItems?: number
	maxHeight?: number | string
	title: string
}

/* * */

export function MenuList<T>({ data, getItemKey, itemComponent, maxDisplayedItems, maxHeight = 300, title }: MenuListProps<T>) {
	//

	//
	// A. Setup variables

	const [showAll, setShowAll] = useState(false);
	const displayData = useMemo(() => {
		return showAll ? data : data.slice(0, maxDisplayedItems);
	}, [data, showAll, maxDisplayedItems]);

	//
	// C. Render components
	if (data.length === 0) {
		return null;
	}

	return (
		<Section flexDirection="column" gap="sm" maxHeight={maxHeight} overflow="scroll" padding="sm" width="100%">
			<Label size="sm">({data.length}) {title}</Label>
			{displayData.map((item, idx) => (
				createElement(itemComponent, { item, key: getItemKey(item, idx) })
			))}

			{(data.length > (maxDisplayedItems ?? Infinity)) && (
				<button className={styles.moreButton} onClick={() => setShowAll(!showAll)}>
					{showAll ? 'Ver menos' : 'Ver mais'}
				</button>
			)}
		</Section>
	);

	//
}
