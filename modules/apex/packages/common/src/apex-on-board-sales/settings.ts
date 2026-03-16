/* * */

/**
 * Settings for importing and validating APEX On-Board Sale transactions.
 */
export const APEX_ON_BOARD_SALES_SETTINGS = {

	/**
	 * The version type corresponding to APEX On-Board Sale
	 * transactions in the PCGI database.
	 * Only import transactions with this type.
	 * @constant `3` Sale transactions (all sales, including refunds and store sales)
	 */
	allowed_apex_transaction_type: 3,

	/**
	 * List of allowed schema versions for APEX On-Board Sale transactions.
	 * Only import transactions with these versions.
	 */
	allowed_apex_transaction_versions: ['2.0', '3.0'],

	/**
	 * Value for allowed card physical type for APEX On-Board Sale transactions.
	 * Only import transactions with this card physical type.
	 * @constant `28` Paper tickets (only available for on-board sales)
	 */
	allowed_card_physical_type: 28,

	/**
	 * List of allowed operator long IDs for APEX On-Board Sale transactions.
	 * Only import transactions from these operator IDs.
	 */
	allowed_operator_long_ids: ['1', '4', '21', '41', '42', '43', '44'],

} as const;
