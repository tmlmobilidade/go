export interface IDatabaseService {
	/**
     * Backs up the database.
     */
	backup(outputPath: string): Promise<void>

	/**
     * Connects to the database.
     */
	connect(): Promise<unknown>

	/**
     * Disconnects from the database.
     */
	disconnect(): Promise<unknown>

	/**
     * Restores the database from the latest backup.
     */
	restore(backupPath: string): Promise<void>
}
