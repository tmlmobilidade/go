/* * */

export type OfferDemoModuleId = 'annotations' | 'calendar' | 'events' | 'fares' | 'holidays' | 'lines' | 'stops' | 'typologies' | 'year_periods' | 'zones';

/* * */

export interface OfferDemoScreenshot {
	alt: string
	src: string
}

export interface OfferDemoModule {
	id: OfferDemoModuleId
	screenshot?: OfferDemoScreenshot
	title: string
	video?: {
		src: string
	}
}

/* * */

export const offerDemoContent = {
	chrome: {
		environment: 'DEMO',
		greeting: 'OLÁ JOÃO',
		logoSrc: '/hub/assets/demo/logo.png',
		status: 'Preview estático',
		url: 'go.tmlmobilidade.pt/oferta',
	},
	demo: {
		ctaLabel: 'Ver demo',
		modalTitle: 'Demo da oferta',
		playLabel: 'Reproduzir demo',
	},
	modules: [
		{
			id: 'lines',
			screenshot: {
				alt: 'Preview do módulo Linhas no GO.',
				src: '/hub/assets/demo/lines.png',
			},
			title: 'Linhas',
			video: {
				src: '/hub/assets/videos/lines.mp4',
			},
		},
		{
			id: 'stops',
			screenshot: {
				alt: 'Preview do módulo Paragens no GO.',
				src: '/hub/assets/demo/stops.png',
			},
			title: 'Paragens',
		},
		{ id: 'typologies', title: 'Tipologias' },
		{ id: 'fares', title: 'Tarifas' },
		{ id: 'zones', title: 'Zonas' },
		{ id: 'calendar', title: 'Calendário' },
		{ id: 'year_periods', title: 'Períodos do Ano' },
		{ id: 'events', title: 'Eventos & Exceções' },
		{ id: 'holidays', title: 'Feriados' },
		{ id: 'annotations', title: 'Anotações' },
	] satisfies readonly OfferDemoModule[],
};
