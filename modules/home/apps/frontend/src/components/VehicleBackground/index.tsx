'use client';

/* * */

import { useEffect, useMemo, useRef, useState } from 'react';

import styles from './styles.module.css';

import { useVehicles } from './useVehicles';
import { vehiclesToGridPositions } from './utils';
import { VehicleCanvas } from './VehicleCanvas';

/* * */

export function VehicleBackground() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState({ height: 0, width: 0 });

	const { vehicles } = useVehicles();

	// Track container dimensions
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const updateDimensions = () => {
			setDimensions({
				height: container.offsetHeight,
				width: container.offsetWidth,
			});
		};

		// Initial measurement
		updateDimensions();

		// Observe size changes
		const resizeObserver = new ResizeObserver(updateDimensions);
		resizeObserver.observe(container);

		return () => {
			resizeObserver.disconnect();
		};
	}, []);

	// Convert vehicles to grid positions
	const gridPositions = useMemo(() => {
		if (dimensions.width === 0 || dimensions.height === 0) return [];
		return vehiclesToGridPositions(vehicles, dimensions.width, dimensions.height);
	}, [vehicles, dimensions.width, dimensions.height]);

	return (
		<div ref={containerRef} className={styles.container}>
			{dimensions.width > 0 && dimensions.height > 0 && (
				<VehicleCanvas
					height={dimensions.height}
					positions={gridPositions}
					width={dimensions.width}
				/>
			)}
		</div>
	);
}
