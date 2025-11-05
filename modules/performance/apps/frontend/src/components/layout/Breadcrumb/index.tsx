/* * */

import { Breadcrumbs } from '@go/ui';

import styles from './styles.module.css';

export default function Breadcrumb({ items }: { items: { href: string, title: string }[] }) {
	//

	// A. Setup variables

	//
	// B. Transform data

	const breadcrumbsData = items.map((item, index) => {
		const isLastItem = index === items.length - 1;

		if (isLastItem) {
			return (
				<span key={index} className={`${styles.breadcrumbItem} ${styles.activeBreadcrumbItem}`}>
					{item.title}
				</span>
			);
		}

		return (
			<a key={index} className={styles.breadcrumbItem} href={item.href}>
				{item.title}
			</a>
		);
	});

	// C. Render components

	return (
		<Breadcrumbs separator="/" separatorMargin="xs">
			{breadcrumbsData}
		</Breadcrumbs>

	);
}

//
