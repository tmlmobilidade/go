'use client';

/* * */

import { useParameterCreateContext } from '@/components/patterns/shape/parameters/create/ParameterCreate.context';
import { IconArrowNarrowDown, IconClockPause, IconGauge } from '@tabler/icons-react';
import { PatternsDetailPathItem } from '@tmlmobilidade/go-offer-pckg-types';
import { Divider, NumberInput, StandardFormController, Text } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface ParameterCreateStopItemProps {
	distance: null | number
	index: number
	isLast: boolean
	nextPathItem?: PatternsDetailPathItem
	pathItem: PatternsDetailPathItem
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
	// B. Render components

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
				<StandardFormController
					control={ctx.form.control}
					name={`path.${index}.dwell_time`}
					render={({ field, fieldState }) => (
						<NumberInput
							aria-label={`Tempo de paragem para a sequência ${index + 1}`}
							error={fieldState.error?.message}
							leftSection={<IconClockPause size={14} />}
							max={900}
							min={0}
							placeholder="seg"
							size="xs"
							step={10}
							suffix=" seg"
							{...field}
							value={field.value ?? ''}
						/>
					)}
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
							<StandardFormController
								control={ctx.form.control}
								name={`path.${index + 1}.avg_speed`}
								render={({ field, fieldState }) => (
									<NumberInput
										aria-label={`Velocidade média do segmento ${index + 1}`}
										error={fieldState.error?.message}
										leftSection={<IconGauge size={14} />}
										min={0}
										placeholder="km/h"
										size="xs"
										step={1}
										suffix=" km/h"
										{...field}
										value={field.value ?? ''}
									/>
								)}
							/>
						</>
					)}
			</div>
		</div>
	);
}
