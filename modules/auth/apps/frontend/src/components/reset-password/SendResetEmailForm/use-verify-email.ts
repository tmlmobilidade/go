'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { Session } from '@tmlmobilidade/types';
import { fetchData, HttpResponse } from '@tmlmobilidade/utils';
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
			API_ROUTES.auth.AUTH_VERIFY_EMAIL,
			'POST',
			{ email },
		);

		setLoading(false);

		return response;
	};

	return { loading, verifyEmail };
}
