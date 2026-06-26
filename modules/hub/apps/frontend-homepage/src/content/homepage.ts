/* * */

import { type Icon, IconApi, IconBellRinging, IconChartLine, IconFileCheck, IconMapPin, IconRadar2, IconRoute } from '@tabler/icons-react';

/* * */

export interface HomepageCta {
	label: string
	status: 'disabled'
}

export interface HomepageProduct {
	caption: string
	description: string
	eyebrow: string
	icon: Icon
	id: string
	title: string
	videoCta: HomepageCta
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
		body: 'Cada módulo resolve uma parte crítica do ciclo operacional, mantendo dados compatíveis entre planeamento, publicação, monitorização e análise.',
		eyebrow: 'GO',
		title: 'Uma plataforma modular para equipas que operam rede, oferta e serviço.',
	},
	products: [
		{
			caption: 'Pré-visualização do produto Paragens',
			description: 'Inventário, localização e atributos de paragens numa base única, pronta para publicação, análise e integração operacional.',
			eyebrow: 'Rede',
			icon: IconMapPin,
			id: 'stops',
			title: 'Paragens',
			videoCta: DISABLED_DEMO_CTA,
		},
		{
			caption: 'Pré-visualização do produto Oferta',
			description: 'Modelação de linhas, percursos, zonas, tarifas e padrões, com ferramentas para manter a oferta coerente antes da operação.',
			eyebrow: 'Planeamento',
			icon: IconRoute,
			id: 'offer',
			title: 'Oferta',
			videoCta: DISABLED_DEMO_CTA,
		},
		{
			caption: 'Pré-visualização do produto Validador GTFS e Planos',
			description: 'Validação técnica de ficheiros GTFS e preparação de planos aprovados para publicação nos canais internos e externos.',
			eyebrow: 'Qualidade',
			icon: IconFileCheck,
			id: 'plans',
			title: 'Validador GTFS + Planos',
			videoCta: DISABLED_DEMO_CTA,
		},
		{
			caption: 'Pré-visualização do produto Monitorização de Circulações',
			description: 'Monitorização contínua das circulações em serviço, posições de veículos, estados operacionais e evolução no terreno.',
			eyebrow: 'Tempo real',
			icon: IconRadar2,
			id: 'realtime',
			title: 'Monitorização de Circulações',
			videoCta: DISABLED_DEMO_CTA,
		},
		{
			caption: 'Pré-visualização do produto Alertas',
			description: 'Gestão e publicação de alertas de serviço para manter equipas, canais digitais e passageiros alinhados.',
			eyebrow: 'Comunicação',
			icon: IconBellRinging,
			id: 'alerts',
			title: 'Alertas',
			videoCta: DISABLED_DEMO_CTA,
		},
		{
			caption: 'Pré-visualização do produto Performance',
			description: 'Métricas de oferta, procura e execução para acompanhar desempenho, identificar desvios e sustentar decisões.',
			eyebrow: 'Medição',
			icon: IconChartLine,
			id: 'performance',
			title: 'Performance',
			videoCta: DISABLED_DEMO_CTA,
		},
		{
			caption: 'Pré-visualização do produto Dados Abertos',
			description: 'APIs, feeds e ficheiros de dados abertos para integrar o ecossistema de mobilidade com informação operacional fiável.',
			eyebrow: 'Publicação',
			icon: IconApi,
			id: 'open-data',
			title: 'Dados Abertos',
			videoCta: DISABLED_DEMO_CTA,
		},
	] satisfies HomepageProduct[],
} as const;
