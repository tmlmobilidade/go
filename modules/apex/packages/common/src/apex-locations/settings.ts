/* * */

/**
 * Settings for importing and validating APEX Location transactions.
 */
export const APEX_LOCATIONS_SETTINGS = {

	/**
	 * The version type corresponding to APEX Location
	 * transactions in the PCGI database.
	 * Only import transactions with this type.
	 * @constant `19` Location transaction
	 */
	allowed_apex_transaction_type: 19,

	/**
	 * List of allowed schema versions for APEX Location transactions.
	 * Only import transactions with these versions.
	 */
	allowed_apex_transaction_versions: ['3.0'],

	/**
	 * List of allowed operator long IDs for APEX Location transactions.
	 * Only import transactions from these operator IDs.
	 */
	allowed_operator_long_ids: ['1', '4', '21', '41', '42', '43', '44'],

} as const;
