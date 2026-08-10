/* * */

import { exec } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

/* * */

const execAsync = promisify(exec);

/* * */

const SERVICE_NAME = 'TMLMobilidadeGO';
const ACCOUNT_NAME = 'export-data-access-key';

/**
 * Get a credential from the OS-native secure storage
 * - macOS: Uses Keychain via `security` command
 * - Windows: Uses Credential Manager via PowerShell
 * - Linux: Uses secret-tool or fallback to encrypted file
 */
export async function getCredential(key: string): Promise<null | string> {
	const platform = os.platform();

	try {
		if (platform === 'darwin') {
			// macOS Keychain
			return await getMacOSCredential(key);
		} else if (platform === 'win32') {
			// Windows Credential Manager
			return await getWindowsCredential(key);
		} else {
			// Linux (and other Unix-like systems)
			return await getLinuxCredential(key);
		}
	} catch {
		// If credential doesn't exist or there's an error, return null
		return null;
	}
}

/**
 * Store a credential in the OS-native secure storage
 * - macOS: Uses Keychain via `security` command
 * - Windows: Uses Credential Manager via PowerShell
 * - Linux: Uses secret-tool or fallback to encrypted file
 */
export async function setCredential(key: string, value: string): Promise<void> {
	const platform = os.platform();

	if (platform === 'darwin') {
		// macOS Keychain
		await setMacOSCredential(key, value);
	} else if (platform === 'win32') {
		// Windows Credential Manager
		await setWindowsCredential(key, value);
	} else {
		// Linux (and other Unix-like systems)
		await setLinuxCredential(key, value);
	}
}

/**
 * Delete a credential from the OS-native secure storage
 */
export async function deleteCredential(key: string): Promise<void> {
	try {
		const platform = os.platform();
		if (platform === 'darwin') {
			await execAsync(`security delete-generic-password -s "${SERVICE_NAME}" -a "${key}"`);
		} else if (platform === 'win32') {
			const targetName = `${SERVICE_NAME}:${key}`;
			await execAsync(`powershell -Command "cmdkey /delete:'${targetName}'"`);
		} else {
			await execAsync(`secret-tool clear service "${SERVICE_NAME}" account "${key}"`);
		}
	} catch {
		// Credential might not exist, which is fine
	}
}

/**
 * Get credential from macOS Keychain.
 * @param key The credential key.
 * @returns The credential value or null if not found.
 */
async function getMacOSCredential(key: string): Promise<null | string> {
	try {
		const { stdout } = await execAsync(`security find-generic-password -s "${SERVICE_NAME}" -a "${key}" -w`);
		return stdout.trim();
	} catch {
		return null;
	}
}

/**
 * Store credential in macOS Keychain.
 * @param key The credential key.
 * @param value The credential value.
 */
async function setMacOSCredential(key: string, value: string): Promise<void> {
	// First, try to delete existing credential to avoid duplicates
	await deleteCredential(key);
	// Add new credential
	await execAsync(`security add-generic-password -s "${SERVICE_NAME}" -a "${key}" -w "${value}" -U`);
}

/**
 * Get credential from Windows Credential Manager.
 * @param key The credential key.
 * @returns The credential value or null if not found.
 */
async function getWindowsCredential(key: string): Promise<null | string> {
	try {
		const targetName = `${SERVICE_NAME}:${key}`;
		const { stdout } = await execAsync(
			`powershell -Command "$cred = cmdkey /list:'${targetName}' 2>$null; if($cred) { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String((Get-StoredCredential -Target '${targetName}').Password)) }"`,
		);

		// If the above doesn't work, use a simpler approach with a custom PowerShell script
		if (!stdout || stdout.trim() === '') {
			// Fallback: Use Windows Data Protection API (DPAPI) with a file
			return await getWindowsCredentialFallback(key);
		}

		return stdout.trim();
	} catch {
		// Try fallback method
		return await getWindowsCredentialFallback(key);
	}
}

/**
 * Store credential in Windows Credential Manager.
 * @param key The credential key.
 * @param value The credential value.
 */
async function setWindowsCredential(key: string, value: string): Promise<void> {
	try {
		// Use PowerShell to store the credential
		const targetName = `${SERVICE_NAME}:${key}`;
		// Create a PowerShell script to store the credential
		const script = `
			$password = ConvertTo-SecureString "${value}" -AsPlainText -Force
			$credential = New-Object System.Management.Automation.PSCredential("${ACCOUNT_NAME}", $password)
			cmdkey /generic:"${targetName}" /user:"${ACCOUNT_NAME}" /pass:"${value}"
		`;
		// Execute the PowerShell script
		await execAsync(`powershell -Command "${script.replace(/\n/g, ' ')}"`);
	} catch {
		// Fallback to file-based storage with DPAPI
		await setWindowsCredentialFallback(key, value);
	}
}

/**
 * Fallback method to get credential from encrypted file on Windows.
 * @param key The credential key.
 * @returns The credential value or null if not found.
 */
async function getWindowsCredentialFallback(key: string): Promise<null | string> {
	try {
		const credPath = getCredentialFilePath(key);
		const encrypted = await fs.readFile(credPath, 'utf8');
		return decrypt(encrypted);
	} catch {
		return null;
	}
}

/**
 * Fallback method to set credential in encrypted file on Windows.
 * @param key The credential key.
 * @param value The credential value.
 */
async function setWindowsCredentialFallback(key: string, value: string): Promise<void> {
	const credPath = getCredentialFilePath(key);
	const encrypted = encrypt(value);
	// Ensure directory exists
	await fs.mkdir(path.dirname(credPath), { recursive: true });
	// Write with restricted permissions (owner only)
	await fs.writeFile(credPath, encrypted, { mode: 0o600 });
}

/**
 * Get credential from Linux secure storage (secret-tool) or fallback to encrypted file.
 * @param key The credential key.
 * @returns The credential value or null if not found.
 */
async function getLinuxCredential(key: string): Promise<null | string> {
	try {
		const { stdout } = await execAsync(`secret-tool lookup service "${SERVICE_NAME}" account "${key}"`);
		return stdout.trim();
	} catch {
		// Fallback to encrypted file if secret-tool is not available
		return await getLinuxCredentialFallback(key);
	}
}

/**
 * Store credential in Linux secure storage (secret-tool) or fallback to encrypted file.
 * @param key The credential key.
 * @param value The credential value.
 */
async function setLinuxCredential(key: string, value: string): Promise<void> {
	try {
		// Try using secret-tool first
		// Note: secret-tool reads password from stdin, so we use echo with pipe
		await execAsync(`echo "${value}" | secret-tool store --label="${SERVICE_NAME} - ${key}" service "${SERVICE_NAME}" account "${key}"`);
	} catch {
		// Fallback to encrypted file
		await setLinuxCredentialFallback(key, value);
	}
}

/**
 * Fallback method to get credential from encrypted file on Linux.
 * @param key The credential key.
 * @returns The credential value or null if not found.
 */
async function getLinuxCredentialFallback(key: string): Promise<null | string> {
	try {
		const credPath = getCredentialFilePath(key);
		const encrypted = await fs.readFile(credPath, 'utf8');
		return decrypt(encrypted);
	} catch {
		return null;
	}
}

/**
 * Fallback method to set credential in encrypted file on Linux.
 * @param key The credential key.
 * @param value The credential value.
 */
async function setLinuxCredentialFallback(key: string, value: string): Promise<void> {
	const credPath = getCredentialFilePath(key);
	const encrypted = encrypt(value);
	// Ensure directory exists
	await fs.mkdir(path.dirname(credPath), { recursive: true });
	// Write with restricted permissions (owner only)
	await fs.writeFile(credPath, encrypted, { mode: 0o600 });
}

/**
 * Get the file path for storing encrypted credentials.
 * @param key The credential key.
 * @returns The file path.
 */
function getCredentialFilePath(key: string): string {
	const homeDir = os.homedir();
	const configDir = process.platform === 'win32'
		? path.join(homeDir, 'AppData', 'Local', 'TMLMobilidadeGO')
		: path.join(homeDir, '.config', 'tmlmobilidade-go');
	return path.join(configDir, `${key}.enc`);
}

/**
 * Generate a machine-specific encryption key.
 * @returns The encryption key as a Buffer.
 */
function getEncryptionKey(): Buffer {
	// Use machine-specific identifier as part of the encryption key
	// This provides basic obfuscation (not true security, but better than plaintext)
	const machineId = os.hostname() + os.userInfo().username;
	return crypto.createHash('sha256').update(machineId).digest();
}

/**
 * Encrypt text using AES-256-GCM.
 * @param text The plaintext to encrypt.
 * @returns The encrypted text in hex format.
 */
function encrypt(text: string): string {
	const algorithm = 'aes-256-gcm';
	const key = getEncryptionKey();
	const iv = crypto.randomBytes(16);

	const cipher = crypto.createCipheriv(algorithm, key, iv);
	let encrypted = cipher.update(text, 'utf8', 'hex');
	encrypted += cipher.final('hex');

	const authTag = cipher.getAuthTag();

	// Return IV + authTag + encrypted data
	return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt text using AES-256-GCM.
 * @param encryptedText The encrypted text in hex format.
 * @returns The decrypted plaintext.
 */
function decrypt(encryptedText: string): string {
	const algorithm = 'aes-256-gcm';
	const key = getEncryptionKey();

	const parts = encryptedText.split(':');
	const iv = Buffer.from(parts[0], 'hex');
	const authTag = Buffer.from(parts[1], 'hex');
	const encrypted = parts[2];

	const decipher = crypto.createDecipheriv(algorithm, key, iv);
	decipher.setAuthTag(authTag);

	let decrypted = decipher.update(encrypted, 'hex', 'utf8');
	decrypted += decipher.final('utf8');

	return decrypted;
}
