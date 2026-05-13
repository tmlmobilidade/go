'use client';

import type { Alert } from '@tmlmobilidade/go-hub-pckg-types';

import { AlertsCarouselSlide } from '@/components/common/AlertsCarouselSlide';
import Carousel from '@/components/common/Carousel';
import { getAlertDescription } from '@/utils/alerts';
import { useLocale } from 'next-intl';

/* * */

interface Props {
	alerts: Alert[]
	target?: '_blank' | '_self'
}

/* * */

export function AlertsCarousel({ alerts, target = '_self' }: Props) {
	//

	const locale = useLocale();

	const carouselSlides = alerts?.map(slideItem => ({
		_id: slideItem.alert_id + getAlertDescription(slideItem, locale),
		component: (
			<AlertsCarouselSlide alert={slideItem} target={target} />
		),
	}));

	return (
		<Carousel slides={carouselSlides} />
	);

	//
}
