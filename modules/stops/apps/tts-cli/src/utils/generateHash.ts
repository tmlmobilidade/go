import crypto from 'crypto';

export async function generateHash(string: string, stopId: string) {
	const hashInput = `${string}${stopId}`;
	const hash = crypto.createHash('sha256').update(hashInput).digest('hex');
	console.log(`Hash generated for ${string} (${stopId}): ${hash}`);
	return hash;
};
