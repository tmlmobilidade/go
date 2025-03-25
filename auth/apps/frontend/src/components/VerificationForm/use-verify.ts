'use client';

import { fetchData, HttpResponse } from '@/lib/http';
import { Session } from '@tmlmobilidade/core-types';
import bcrypt from 'bcryptjs';
import { useState } from 'react';

interface UseLoginReturn {
	loading: boolean
	verify: (token: string, password: string, confirmPassword: string) => Promise<HttpResponse<Session>>
}

export function useVerify(): UseLoginReturn {
	const [loading, setLoading] = useState<boolean>(false);

	const verify = async (token: string, password: string) => {
		setLoading(true);

		const password_hash = bcrypt.hashSync(password);

		const response = await fetchData<Session>(
			`/api/verify`,
			'POST',
			{ password_hash, token },
		);

		setLoading(false);

		return response;
	};

	return { loading, verify };
}
