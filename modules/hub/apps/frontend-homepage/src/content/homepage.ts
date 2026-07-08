/* * */

import { type Icon, IconApi, IconBellRinging, IconChartLine, IconFileCheck, IconMapPin, IconRadar2, IconRoute } from '@tabler/icons-react';

/* * */

export interface HomepageCta {
	label: string
	status: 'disabled'
}

/* * */

const DISABLED_DEMO_CTA: HomepageCta = {
	label: 'Demo indisponível',
	status: 'disabled',
};

/* * */

export const homepageContent = {
	contact: {
		body: 'Estamos a preparar a próxima versão pública do GO. A página já está pronta para receber documentação, pedidos de acesso e contactos comerciais quando os destinos forem fechados.',
		cta: {
			label: 'Pedir contacto',
			status: 'disabled',
		} satisfies HomepageCta,
		eyebrow: 'Contacto',
		title: 'Traga a sua operação para uma camada comum de dados, planeamento e controlo.',
	},
	header: {
		docs: {
			label: 'Documentação',
			status: 'disabled',
		} satisfies HomepageCta,
		login: {
			label: 'Entrar',
			status: 'disabled',
		} satisfies HomepageCta,
	},
	hero: {
		body: 'GO é a plataforma da TML para gerir operações de transporte público entre operadores, autoridades, empresas e modos. Reúne planeamento, rede, circulação, alertas, validação e métricas num sistema operacional comum.',
		eyebrow: 'Transportes Metropolitanos de Lisboa',
		primaryCta: {
			label: 'Documentação',
			status: 'disabled',
		} satisfies HomepageCta,
		secondaryCta: {
			label: 'Receber novidades',
			status: 'disabled',
		} satisfies HomepageCta,
		title: 'A camada operacional para transporte público em tempo real.',
	},
	map: {
		fallbackBody: 'A pré-visualização volta automaticamente quando houver posições publicadas.',
		fallbackTitle: 'Tempo real indisponível',
		statusLabel: 'veículos em movimento',
	},
	productIntro: {
		body: 'Organize a oferta num único lugar, valide a rede com clareza e exporte em GTFS para alimentar os vários canais de informação.',
		eyebrow: 'Oferta',
		title: 'A rede começa aqui',
	},
	// sections: [
	// 	{
	// 		name: 'Paragens',
	// 		title: 'A rede começa no ponto certo',
	// 		description: 'Centralize a gestão das paragens, valide localizações e mantenha uma base fiável para construir percursos, horários e informação ao passageiro.',
	// 	},
	// 	{
	// 		name: 'Oferta',
	// 		title: 'Construa a rede',
	// 		description: 'Organize linhas, percursos e horários num único fluxo, valide a oferta com clareza e exporte em GTFS para alimentar os vários canais de informação.',
	// 	},
	// 	{
	// 		eyebrow: 'Validador GTFS + Planos',
	// 		title: 'Tudo pronto para operar',
	// 		body: 'Confirme a qualidade dos dados, resolva inconsistências e prepare planos de operação fiáveis a partir da rede publicada.',
	// 	},
	// 	{
	// 		eyebrow: 'Monitorização de Circulações',
	// 		title: 'Acompanhe o serviço',
	// 		body: 'Veja cada circulação em detalhe, compare o planeado com o observado e identifique rapidamente desvios na execução da operação.',
	// 	},
	// 	{
	// 		eyebrow: 'Alertas',
	// 		title: 'Responda à mudança',
	// 		body: 'Crie e acompanhe alertas de serviço para comunicar alterações, gerir impactos na rede e manter a operação coordenada.',
	// 	},
	// 	{
	// 		eyebrow: 'Performance',
	// 		title: 'Melhore com evidência',
	// 		body: 'Transforme dados operacionais em indicadores claros para avaliar qualidade, explicar resultados e apoiar decisões de melhoria.',
	// 	},
	// ] satisfies HomepageProduct[],
} as const;
