'use client';

import { HomePageHeader } from '@/components/header/HomePageHeader';
import { AlertsSection } from '@/components/home/AlertsSection';
import { HomePageFilterbar } from '@/components/home/HomePageFilterbar';
import { LinesSection } from '@/components/home/LinesSection';
import { StopsSection } from '@/components/home/StopsSection';
import { VehiclesSection } from '@/components/home/VehiclesSection';
import { useGlobalSettingsContext } from '@/contexts/GlobalSettings.context';

/* * */

export function HomePage() {
	//

	//
	// A. Setup Variables

	const globalSettingsContext = useGlobalSettingsContext();

	//
	// B. Render Components

	return (
		<>
			<HomePageHeader />
			<HomePageFilterbar />
			{globalSettingsContext.section === 'alerts' && <AlertsSection />}
			{globalSettingsContext.section === 'lines' && <LinesSection />}
			{globalSettingsContext.section === 'stops' && <StopsSection />}
			{globalSettingsContext.section === 'vehicles' && <VehiclesSection />}
		</>
	);

	//
}
