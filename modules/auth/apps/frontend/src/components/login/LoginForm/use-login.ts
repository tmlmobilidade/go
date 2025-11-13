'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { LoginDto, Session } from '@tmlmobilidade/types';
import { fetchData, HttpResponse } from '@tmlmobilidade/utils';
import { useState } from 'react';

interface UseLoginReturn {
	loading: boolean
	login: (credentials: LoginDto) => Promise<HttpResponse<Session>>
}

export function useLogin(): UseLoginReturn {
	const [loading, setLoading] = useState<boolean>(false);

	const login = async (credentials: LoginDto) => {
		setLoading(true);

		const response = await fetchData<Session>(
			API_ROUTES.auth.AUTH_LOGIN,
			'POST',
			credentials,
		);

		setLoading(false);

		return response;
	};

	return { loading, login };
}
