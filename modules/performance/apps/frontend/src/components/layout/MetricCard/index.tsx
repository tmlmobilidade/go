'use client';

import { LiveIcon } from '@/components/layout/LiveIcon';
import { TrendChip } from '@/components/layout/TrendChip';
import { Divider, Skeleton } from '@tmlmobilidade/ui';
import { type ReactNode } from 'react';

import styles from './styles.module.css';

/* * */

interface MetricCardProps {
	children?: ReactNode
	goal: 'decrease' | 'increase'
	icon?: ReactNode
	isLoading?: boolean
	previousValue?: number
	title: string
	updatedAt?: Date
	value: number
}

/* * */

export function MetricCard({
	children,
	goal,
	icon,
	isLoading,
	previousValue,
	title,
	updatedAt,
	value,
}: MetricCardProps) {
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
						<>
							<span className={styles.value}>
								{value.toLocaleString()}
							</span>
							{previousValue > 0 && (
								<TrendChip goal={goal} previousValue={previousValue} value={value} />
							)}
						</>
					)}

				</div>
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
