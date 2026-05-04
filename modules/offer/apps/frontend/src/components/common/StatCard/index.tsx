/* * */

import { IconChevronRight } from '@tabler/icons-react';
import { CopyButton, Loader, Text } from '@tmlmobilidade/ui';
import Link from 'next/link';

import styles from './styles.module.css';

/* * */

interface StatCardProps {
	isLoading?: boolean
	link?: string
	title: string
	type?: 'copy' | 'link'
	value: number | string
}

/* * */

export default function StatCard({ isLoading = false, link, title, type = 'copy', value }: StatCardProps) {
	//

	if (isLoading || (!value && value !== 0)) {
		return (
			<div className={styles.container}>
				<div className={styles.wrapper}>
					<Text size="xl">{title}</Text>
					<Loader visible />
				</div>
			</div>
		);
	}

	if (type === 'copy') {
		return (
			<CopyButton value={String(value)}>
				{({ copied, copy }) => (
					<div className={styles.container} onClick={copy}>
						<div className={styles.wrapper}>
							<Text size="xl">{copied ? 'Value Copied' : title}</Text>
							<div className={styles.value}>{value}</div>
						</div>
					</div>
				)}
			</CopyButton>
		);
	}

	if (type === 'link') {
		return (
			<Link href={link} target="_blank">
				<div className={styles.container}>
					<div className={styles.wrapper}>
						<Text size="xl">{title}</Text>
						<div className={styles.value}>{value}</div>
					</div>
					<IconChevronRight className={styles.chevron} />
				</div>
			</Link>
		);
	}

	//
}
