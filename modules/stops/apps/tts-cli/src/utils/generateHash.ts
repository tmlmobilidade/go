import crypto from 'crypto';

export async function generateHash(string: string) {
	const hash = crypto.createHash('sha256').update(string).digest('hex');
	console.log(`Hash generated for ${string}: ${hash}`);
	return hash;
};
