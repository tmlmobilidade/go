'use client';

import type { HubAlert } from '@tmlmobilidade/types';

import { AlertsCarouselSlide } from '@/components/lines/common/AlertsCarouselSlide';
import Carousel from '@/components/lines/common/Carousel';

/* * */

interface Props {
	alerts: HubAlert[]
	target?: '_blank' | '_self'
}

/* * */

export function AlertsCarousel({ alerts, target = '_self' }: Props) {
	const carouselSlides = alerts?.map((slideItem, index) => ({
		_id: `${slideItem._id}-${index}`,
		component: (
			<AlertsCarouselSlide alert={slideItem} target={target} />
		),
	}));

	return (
		<Carousel slides={carouselSlides} />
	);
}
