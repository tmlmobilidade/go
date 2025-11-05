'use client';

import { Session } from '@tmlmobilidade/go-types';
import { fetchData, HttpResponse } from '@tmlmobilidade/go-utils';
import { useState } from 'react';

interface UseverifyEmailReturn {
	loading: boolean
	verifyEmail: (email: string) => Promise<HttpResponse<Session>>
}

export function useVerifyEmail(): UseverifyEmailReturn {
	const [loading, setLoading] = useState<boolean>(false);

	const verifyEmail = async (email: string) => {
		setLoading(true);

		const response = await fetchData<Session>(
			`/api/verify-email`,
			'POST',
			{ email },
		);

		setLoading(false);

		return response;
	};

	return { loading, verifyEmail };
}
