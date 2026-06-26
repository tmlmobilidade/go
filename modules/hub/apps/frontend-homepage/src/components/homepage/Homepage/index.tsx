/* * */

import { EndSection } from '@/components/homepage/EndSection';
import { HeroSection } from '@/components/homepage/HeroSection';
import { HomepageHeader } from '@/components/homepage/HomepageHeader';
import { ProductSection } from '@/components/homepage/ProductSection';
import { RealtimeVehicleMap } from '@/components/homepage/RealtimeVehicleMap';
import { homepageContent } from '@/content/homepage';

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
			<section className={styles.productsSection} id="produto">
				<div className={styles.sectionHeader}>
					<span className={styles.eyebrow}>{homepageContent.productIntro.eyebrow}</span>
					<h2>{homepageContent.productIntro.title}</h2>
					<p>{homepageContent.productIntro.body}</p>
				</div>
				<div className={styles.productsGrid}>
					{homepageContent.products.map((product, index) => (
						<ProductSection
							key={product.title}
							product={product}
							variant={index % 2 === 0 ? 'regular' : 'inverted'}
						/>
					))}
				</div>
			</section>
			<EndSection />
		</main>
	);
}
