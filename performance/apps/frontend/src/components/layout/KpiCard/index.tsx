'use client';

/* * */

import { LiveIcon } from '@/components/layout/LiveIcon';
import { VisualizationContainer } from '@/components/layout/VisualizationContainer';
import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react';
import { Divider } from '@tmlmobilidade/ui';
import { type ReactNode } from 'react';

import styles from './styles.module.css';

/* * */

interface KpiCardProps {
	headerIcon?: ReactNode
	headerTitle: string
	headerValue: number | string
	headerValueVariation?: { isPositive: boolean, label: string, value: number }
	height?: number | string
	items?: {
		isDelta?: boolean
		label: string
		value: number | string
	}[]
	style?: React.CSSProperties
	updatedAt?: Date
}

/* * */

// TODO: Refactor this component into smaller bits

export function KpiCard({
	headerIcon,
	headerTitle,
	headerValue,
	headerValueVariation,
	height,
	items,
	style,
	updatedAt,
}: KpiCardProps) {
	return (
		<VisualizationContainer height={height} padding="0" style={style}>
			<div className={styles.container}>
				<div className={styles.topContainer}>
					<div className={styles.header}>
						{headerIcon && <div className={styles.icon}>{headerIcon}</div>}
						<span className={styles.title}>{headerTitle}</span>
						{updatedAt && <LiveIcon updatedAt={updatedAt} />}
					</div>

					<div className={styles.valueContainer}>
						<span className={styles.value}>
							{headerValue}
						</span>
						{headerValueVariation && (
							<div
								className={`${styles.delta} ${headerValueVariation.isPositive ? styles.deltaPositive : styles.deltaWarning}`}
							>
								{headerValueVariation.label}
							</div>
						)}
					</div>
				</div>

				{items && items.length > 0 && (
					<>
						<Divider />

						<div className={styles.bottomContainer}>
							{items?.map((item, index) => (
								<div key={index} className={styles.valueGroup}>
									<span className={styles.itemLabel}>{item.label}</span>

									{item.isDelta ? (
										<div
											className={`${styles.delta} ${
												Number(item.value) > 0 ? styles.deltaPositive : ''
											} ${Number(item.value) < 0 ? styles.deltaNegative : ''}`}
										>
											{Number(item.value) > 0 && <IconArrowUpRight className={styles.deltaIcon} size={14} />}
											{Number(item.value) < 0 && <IconArrowDownRight className={styles.deltaIcon} size={14} />}
											{Math.abs(Number(item.value)).toFixed(1)}%
										</div>
									) : (
										<span className={styles.itemValue}>
											{item.value}
											{item.isDelta && '%'}
										</span>
									)}
								</div>
							))}
						</div>
					</>
				)}
			</div>
		</VisualizationContainer>
	);
}
