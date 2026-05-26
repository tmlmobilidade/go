'use client';

import { AnimatedNumber } from '@/components/layout/AnimatedNumber';
import { IndicatorChip } from '@/components/layout/IndicatorChip';
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
	title?: string
	totalValue?: number
	updatedAt?: Date
	value: number
	valueIsPercentage?: boolean
}

/* * */

export function RecordCard({
	children,
	description,
	icon,
	isLoading,
	title,
	totalValue,
	updatedAt,
	value,
	valueIsPercentage,
}: RecordCardProps) {
	return (
		<div className={styles.container}>

			<div className={styles.topContainer}>
				<div className={styles.header}>
					{icon && <div className={styles.icon}>{icon}</div>}
					{title && <span className={styles.title}>{title}</span>}
					{updatedAt && <LiveIcon updatedAt={updatedAt} />}
				</div>

				<div className={styles.valueContainer}>
					{isLoading ? <Skeleton height={50} width="50%" /> : (
						<AnimatedNumber className={styles.value} isPercentage={valueIsPercentage} value={value} />
					)}
					{totalValue > 0 && <IndicatorChip goal="decrease" targetValue={100} totalValue={totalValue} value={value} />}
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
