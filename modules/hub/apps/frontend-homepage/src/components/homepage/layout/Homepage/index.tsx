/* * */

import { HeroSection } from '@/components/homepage/hero/HeroSection';
import { EndSection } from '@/components/homepage/layout/EndSection';
import { RealtimeVehicleMap } from '@/components/homepage/layout/RealtimeVehicleMap';
import { OfferSection } from '@/components/modules/offer/OfferSection';

import styles from './styles.module.css';

/* * */

export function Homepage() {
	return (
		<main className={styles.container}>
			<section className={styles.heroShell}>
				<RealtimeVehicleMap variant="background" />
				<div className={styles.heroForeground}>
					{/* <HomepageHeader /> */}
					<HeroSection />
				</div>
			</section>
			<section className={styles.content}>
				<OfferSection />
			</section>
			<EndSection />
		</main>
	);
}
