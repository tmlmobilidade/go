'use client';

/* * */

import { Anchor, Breadcrumbs } from '@mantine/core';
import { IconDots } from '@tabler/icons-react';
import { TextInput } from '@tmlmobilidade/ui';
import { useState } from 'react';

/* * */

import styles from './styles.module.css';

/* * */

export default function SearchBar() {
	//

	//
	// A. Render components

	const [isOpen, setIsOpen] = useState(false);

	//
	// B. Transform data

	const items = [
		{ href: '#', title: 'Mantine' },
		{ href: '#', title: 'Mantine hooks' },
		{ href: '#', title: 'use-id' },
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
				placeholder="Pesquisar..."
				// disabled
				// {...alertDetailData.form.getInputProps('title')}
			/>

			{/* Settings Button */}
			<div className={styles.icon} onClick={() => setIsOpen((isOpen: boolean) => !isOpen)}>
				<IconDots />
				{isOpen && <Breadcrumbs className={styles.breadcrumbs}>{items}</Breadcrumbs>}
			</div>
		</div>
	);
}
