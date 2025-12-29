/* * */

import { deleteCredential, getCredential, setCredential } from '@/utils/credential-storage.js';
import { cancel, isCancel, note, spinner, text } from '@clack/prompts';

/* * */

const CREDENTIAL_KEY = 'access-key';

/* * */

export async function promptEnvironmentVariable(): Promise<void> {
	//

	//
	// Delete credentials on init

	await deleteCredential(CREDENTIAL_KEY);

	//
	// Check if there is an access key already saved in the computer

	const s = spinner();

	s.start('A verificar credenciais guardadas...');

	const existingKey = await getCredential(CREDENTIAL_KEY);

	if (existingKey) {
		s.stop('Chave de acesso encontrada no armazenamento seguro do sistema.');
		process.env.DATABASE_URI = existingKey;
		return;
	}

	s.stop('Nenhuma chave de acesso encontrada.');

	//
	// If no key exists, ask the user to enter the access key

	note(
		'A chave de acesso será guardada de forma segura:\n'
		+ '  • macOS: Keychain\n'
		+ '  • Windows: Credential Manager\n'
		+ '  • Linux: Secret Service (ou ficheiro encriptado)',
	);

	const accessKey = await text({
		message: 'Por favor introduz a chave de acesso:',
		placeholder: 'Chave de acesso...',
		validate: (value) => {
			if (!value || value.trim().length === 0) {
				return 'A chave de acesso não pode estar vazia.';
			}
		},
	});

	//
	// Verify if the user cancelled the operation

	if (isCancel(accessKey)) {
		cancel('Operação cancelada pelo utilizador.');
		process.exit(0);
	}

	if (!accessKey || typeof accessKey !== 'string') {
		cancel('Chave de acesso inválida.');
		process.exit(1);
	}

	//
	// Save the access key to the computer's secure storage

	s.start('A guardar chave de acesso...');

	try {
		await setCredential(CREDENTIAL_KEY, accessKey);
		s.stop('Chave de acesso guardada com sucesso no armazenamento seguro do sistema.');
	}
	catch (error) {
		s.stop('Erro ao guardar a chave de acesso.');
		cancel(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
		process.exit(1);
	}

	process.env.DATABASE_URI = accessKey;
}
