'use client';

/* * */

import { useParameterCreateContext } from '@/components/patterns/shape/parameters/create/ParameterCreate.context';
import { IconArrowNarrowDown, IconClockPause, IconGauge } from '@tabler/icons-react';
import { PopulatedPath } from '@tmlmobilidade/types';
import { Divider, NumberInput, Text } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface ParameterCreateStopItemProps {
	distance: null | number
	index: number
	isLast: boolean
	nextPathItem?: PopulatedPath
	pathItem: PopulatedPath
	travelTime: string
}

/* * */

export function ParameterCreateStopItem({ distance, index, isLast, nextPathItem, pathItem, travelTime }: ParameterCreateStopItemProps) {
	//

	//
	// A. Setup variables

	const ctx = useParameterCreateContext();

	//
	// B. Transform data

	const distanceLabel = distance != null && distance > 0
		? (distance >= 1000 ? `${(distance / 1000).toFixed(1)} km` : `${Math.round(distance)} m`)
		: null;

	//
	// C. Render components

	return (
		<div className={styles.card}>
			{/* Stop header row: name + dwell input */}
			<div className={styles.stopRow}>
				<div className={styles.stopInfo}>
					<Text weight="semibold">
						{index + 1}. {pathItem.stop?.name ?? `Paragem ${pathItem.stop_id}`}
					</Text>
					<Text c="var(--color-system-text-200)" size="xs">
						#{pathItem.stop_id}
					</Text>
				</div>
				<NumberInput
					aria-label={`Tempo de paragem para a sequência ${index + 1}`}
					leftSection={<IconClockPause size={14} />}
					max={900}
					min={0}
					placeholder="seg"
					size="xs"
					step={10}
					suffix=" seg"
					{...ctx.data.form.getInputProps(`path.${index}.dwell_time`)}
				/>
			</div>

			{/* Segment section */}
			<Divider />
			<div className={styles.segmentRow}>
				{isLast
					? (
						<Text c="var(--color-system-text-200)" size="sm">Fim da viagem</Text>
					)
					: (
						<>
							<div className={styles.segmentInfo}>
								<div className={styles.segmentDestination}>
									<IconArrowNarrowDown size={14} />
									<Text size="sm">
										{`Até ${nextPathItem?.stop?.name ?? `Paragem ${nextPathItem?.stop_id}`}`}
									</Text>
								</div>
								<Text c="var(--color-system-text-200)" size="xs">
									{[distanceLabel, travelTime].filter(Boolean).join(' · ')}
								</Text>
							</div>
							<NumberInput
								aria-label={`Velocidade média do segmento ${index + 1}`}
								leftSection={<IconGauge size={14} />}
								min={0}
								placeholder="km/h"
								size="xs"
								step={1}
								suffix=" km/h"
								{...ctx.data.form.getInputProps(`path.${index + 1}.avg_speed`)}
							/>
						</>
					)}
			</div>
		</div>
	);
}
