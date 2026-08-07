import crypto from 'crypto';

export async function generateHash(string: string, id: string) {
	const hashInput = `${string}${id}`;
	const hash = crypto.createHash('sha256').update(hashInput).digest('hex');
	console.log(`Hash generated for ${string} (${id}): ${hash}`);
	return hash;
};
