'use client';

import { OperationalBannerNotice } from '../../display/OperationalBannerNotice';
import { Surface } from '../../layout/Surface';
import { useActiveBannersData } from './use-active-banners-data';

/* * */

export function AppWrapperBanner() {
	//

	//
	// A. Setup variables

	const { data, dismiss } = useActiveBannersData();

	//
	// B. Render components

	if (!data.length) {
		return null;
	}

	return (
		<Surface>
			{data.map(banner => (
				<OperationalBannerNotice key={banner._id} banner={banner} onDismiss={() => dismiss(banner)} />
			))}
		</Surface>
	);
}
