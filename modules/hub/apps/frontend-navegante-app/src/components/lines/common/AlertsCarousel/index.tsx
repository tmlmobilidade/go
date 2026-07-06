'use client';

import { AlertsCarouselSlide } from '@/components/lines/common/AlertsCarouselSlide';
import Carousel from '@/components/lines/common/Carousel';
import { type HubAlert } from '@tmlmobilidade/go-types-public-info';

/* * */

interface Props {
	alerts: HubAlert[]
}

/* * */

export function AlertsCarousel({ alerts }: Props) {
	const carouselSlides = alerts?.map((slideItem, index) => ({
		_id: `${slideItem._id}-${index}`,
		component: (
			<AlertsCarouselSlide alert={slideItem} />
		),
	}));

	return (
		<Carousel slides={carouselSlides} />
	);
}
