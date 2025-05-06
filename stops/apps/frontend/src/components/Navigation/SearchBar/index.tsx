'use client';

/* * */

import { Anchor, Breadcrumbs } from '@mantine/core';
import { IconDots } from '@tabler/icons-react';
import { TextInput } from '@tmlmobilidade/ui';
import { useState } from 'react';

/* * */

import { useSearchbarContext } from '@/contexts/Searchbar.context';

import styles from './styles.module.css';

/* * */

export default function SearchBar() {
	//

	//
	// A. Render components

	const [isOpen, setIsOpen] = useState(false);

	const searchbarContext = useSearchbarContext();
	console.log('searchbarContext', searchbarContext);
	//
	// B. Transform data

	const items = [
		{ href: '#', title: 'Exportar stops.txt' },
		{ href: '#', title: 'Exportar deleted_stops.txt' },
		{ href: '#', title: 'Exportar Linhas por Paragem' },
		{ href: '#', title: 'Exportar para ESRI' },
	].map((item, index) => (
		<Anchor key={index} href={item.href}>
			{item.title}
		</Anchor>
	));

	//
	// C. Render components

	return (
		<div className={styles.container}>
			{/* Search Bar */}
			<TextInput
				className={styles.inputText}
				maxLength={255}
				onChange={e => searchbarContext.setQueryString(e.target.value)}
				placeholder="Pesquisar..."
			/>

			{/* Settings Button */}
			<div className={styles.icon} onClick={() => setIsOpen((isOpen: boolean) => !isOpen)}>
				<IconDots />
				{isOpen && <Breadcrumbs className={styles.breadcrumbs}>{items}</Breadcrumbs>}
			</div>
		</div>
	);
}
