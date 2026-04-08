'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Alert } from '@tmlmobilidade/types';
import { Grid, Loader, Section, Surface } from '@tmlmobilidade/ui';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import useSWR from 'swr';

/* * */

export default function AlertsPublicList() {
	//

	//
	// A. Setup Variables

	const sentinelRef = useRef<HTMLDivElement | null>(null);
	const { data: alerts, isLoading: alertsLoading } = useSWR<Alert[]>(`${API_ROUTES.alerts.BASE}/alerts/public`);
	const [visibleCount, setVisibleCount] = useState(20);

	//
	// B. Transform Data

	const visibleAlerts = (alerts ?? []).slice(0, visibleCount);

	useEffect(() => {
		if (!sentinelRef.current) return;
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				setVisibleCount(prev => prev + 20);
			}
		}, { rootMargin: '200px' });
		observer.observe(sentinelRef.current);
		return () => observer.disconnect();
	}, [alerts?.length]);

	//
	// C. Render Components

	if (alertsLoading) {
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
