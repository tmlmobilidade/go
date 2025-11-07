'use client';

/* * */

import React, { useMemo, useState } from 'react';

import styles from './styles.module.css';

import { Label } from '../../display';
import { Section } from '../../layout';

/* * */

interface AppWrapperMenuListProps<T> {
	data: T[]
	itemComponent: React.ComponentType<{ item: T }>
	maxDisplayedItems?: number
	title: string
}

/* * */

export function AppWrapperMenuList<T>({ data, itemComponent, maxDisplayedItems, title }: AppWrapperMenuListProps<T>) {
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
		<Section flexDirection="column" gap="sm" padding="sm" width="100%">
			<Label size="sm">({data.length}) {title}</Label>
			{displayData.map((item, idx) => (
				React.createElement(itemComponent, { item, key: idx })
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
