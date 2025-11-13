'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { Session } from '@tmlmobilidade/types';
import { fetchData, HttpResponse } from '@tmlmobilidade/utils';
import bcrypt from 'bcryptjs';
import { useState } from 'react';

interface UseLoginReturn {
	loading: boolean
	verify: (token: string, password: string) => Promise<HttpResponse<Session>>
}

export function useVerify(): UseLoginReturn {
	const [loading, setLoading] = useState<boolean>(false);

	const verify = async (token: string, password: string) => {
		setLoading(true);

		const password_hash = bcrypt.hashSync(password);

		const response = await fetchData<Session>(
			API_ROUTES.auth.AUTH_VERIFY,
			'POST',
			{ password_hash, token },
		);

		setLoading(false);

		return response;
	};

	return { loading, verify };
}
