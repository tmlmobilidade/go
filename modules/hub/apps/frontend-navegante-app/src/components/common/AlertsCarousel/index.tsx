'use client';

import type { SimplifiedAlert } from '@tmlmobilidade/go-hub-pckg-types';

import { AlertsCarouselSlide } from '@/components/common/AlertsCarouselSlide';
import Carousel from '@/components/common/Carousel';

/* * */

interface Props {
	alerts: SimplifiedAlert[]
	target?: '_blank' | '_self'
}

/* * */

export function AlertsCarousel({ alerts, target = '_self' }: Props) {
	const carouselSlides = alerts?.map((slideItem, index) => ({
		_id: `${slideItem.alert_id}-${index}`,
		component: (
			<AlertsCarouselSlide alert={slideItem} target={target} />
		),
	}));

	return (
		<Carousel slides={carouselSlides} />
	);
}
