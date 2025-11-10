'use client';

/* * */

import { AnimatedNumber } from '@/components/layout/AnimatedNumber';
import { LiveIcon } from '@/components/layout/LiveIcon';
import { Divider, Skeleton } from '@tmlmobilidade/ui';
import { type ReactNode } from 'react';

import styles from './styles.module.css';

/* * */

interface RecordCardProps {
	children?: ReactNode
	description?: string
	icon?: ReactNode
	isLoading?: boolean
	title: string
	updatedAt?: Date
	value: number
}

/* * */

export function RecordCard({
	children,
	description,
	icon,
	isLoading,
	title,
	updatedAt,
	value,
}: RecordCardProps) {
	return (
		<div className={styles.container}>

			<div className={styles.topContainer}>
				<div className={styles.header}>
					{icon && <div className={styles.icon}>{icon}</div>}
					<span className={styles.title}>{title}</span>
					{updatedAt && <LiveIcon updatedAt={updatedAt} />}
				</div>

				<div className={styles.valueContainer}>
					{isLoading ? <Skeleton height={50} width="50%" /> : (
						<AnimatedNumber className={styles.value} value={value} />
					)}
				</div>

				{description && (
					<span className={styles.description}>{description}</span>
				)}
			</div>

			{children && (
				<>
					<Divider />
					{children}
				</>
			)}

		</div>
	);
}
