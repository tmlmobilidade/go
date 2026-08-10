'use client';

/* * */

import { useParameterCreateContext } from '@/components/patterns/shape/parameters/create/ParameterCreate.context';
import { ParameterCreateStopItem } from '@/components/patterns/shape/parameters/create/ParameterCreateStopItem';
import { PopulatedPath } from '@tmlmobilidade/types';

import styles from './styles.module.css';

/* * */

export function ParameterCreateStopsList() {
	const ctx = useParameterCreateContext();

	const paths = (ctx.data.path as PopulatedPath[]) ?? [];
	const mergedPath = ctx.data.mergedPath ?? [];
	const travelTimes = ctx.data.parameterForUI.travelTimes;

	return (
		<div className={styles.container}>
			{paths.map((pathItem, index) => {
				const nextPathItem = paths[index + 1];

				return (
					<ParameterCreateStopItem
						key={pathItem._id ?? `${pathItem.stop_id}-${index}`}
						distance={mergedPath[index + 1]?.distance_delta ?? null}
						index={index}
						isLast={index === paths.length - 1}
						nextPathItem={nextPathItem}
						pathItem={pathItem}
						travelTime={travelTimes.legSeconds.formatted[index] ?? '—'}
					/>
				);
			})}
		</div>
	);
}
