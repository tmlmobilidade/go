'use client';

/* * */

import { useAlertsPublicListContext } from '@/contexts/AlertsPublicList.context';
import { Grid, Loader, Section, Surface } from '@tmlmobilidade/ui';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react';

/* * */

export default function AlertsPublicList() {
	//

	//
	// A. Setup Variables

	const sentinelRef = useRef<HTMLDivElement | null>(null);
	const alertsPublicListContext = useAlertsPublicListContext();
	const [visibleCount, setVisibleCount] = useState(20);

	//
	// B. Transform Data

	const visibleAlerts = alertsPublicListContext.data.filtered.slice(0, visibleCount);

	useEffect(() => {
		if (!sentinelRef.current) return;
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				setVisibleCount(prev => prev + 20);
			}
		}, { rootMargin: '200px' });
		observer.observe(sentinelRef.current);
		return () => observer.disconnect();
	}, [alertsPublicListContext.data.filtered.length]);

	//
	// C. Render Components

	if (alertsPublicListContext.flags.loading) {
		return <Loader size="xl" />;
	}

	return (
		<Surface>
			<Section>
				<Grid columns="abc" gap="md">
					{visibleAlerts?.map(alert => (
						<div key={alert._id}>
							<h2>{alert.title}</h2>
							<p>{alert.description}</p>
						</div>
					))}
				</Grid>
				<div ref={sentinelRef} />
			</Section>
		</Surface>
	);

	//
}
