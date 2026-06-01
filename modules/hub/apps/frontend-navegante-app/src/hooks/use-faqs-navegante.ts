'use client';

import useSWR from 'swr';

const CARRIS_FAQS_URL = `${process.env.NEXT_PUBLIC_CARRIS_BACKOFFICE_URL ?? 'http://localhost:49001'}/admin/public-api/faqs-navegante`;

export interface NaveganteFaq {
	answer: string
	id: string
	question: string
}

interface CarrisFaqResponse {
	answer: string
	id: string
	question: string
}

interface UseFaqsNaveganteOptions {
	enabled?: boolean
}

interface UseFaqsNaveganteReturnType {
	faqs: NaveganteFaq[]
	flags: {
		isLoading: boolean
	}
}

async function fetchFaqs(url: string): Promise<NaveganteFaq[]> {
	const res = await fetch(url, { credentials: 'omit' });

	if (!res.ok) {
		throw new Error(`Failed to fetch FAQs: ${res.status}`);
	}

	const data = await res.json() as CarrisFaqResponse[];

	return data.map(({ answer, id, question }) => ({
		answer,
		id,
		question,
	}));
}

/**
 * A hook that provides the FAQs for the Navegante app.
 * @returns An object with the FAQs and loading flags.
 */
export function useFaqsNavegante({ enabled = true }: UseFaqsNaveganteOptions = {}): UseFaqsNaveganteReturnType {
	//

	//
	// A. Setup variables

	const { data: faqsData, isLoading: faqsLoading } = useSWR<NaveganteFaq[], Error>(
		enabled ? CARRIS_FAQS_URL : null,
		fetchFaqs,
	);

	//
	// D. Return data

	return {
		faqs: faqsData ?? [],
		flags: {
			isLoading: faqsLoading,
		},
	};
}
