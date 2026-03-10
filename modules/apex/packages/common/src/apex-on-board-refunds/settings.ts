/* * */

/**
 * Settings for importing and validating APEX On-Board Refund transactions.
 */
export const APEX_ON_BOARD_REFUNDS_SETTINGS = {

	/**
	 * The version type corresponding to APEX On-Board Refund
	 * transactions in the PCGI database.
	 * Only import transactions with this type.
	 * @constant `6` Refund transactions (all refunds, including on-board refunds)
	 */
	allowed_apex_transaction_types: [6],

	/**
	 * List of allowed schema versions for APEX On-Board Refund transactions.
	 * Only import transactions with these versions.
	 */
	allowed_apex_transaction_versions: ['2.0', '3.0'],

	/**
	 * List of allowed card physical types for APEX On-Board Refund transactions.
	 * Only import transactions with these card physical types.
	 * @constant `28` Paper tickets (only available for on-board refunds)
	 */
	allowed_card_physical_types: [28],

	/**
	 * List of allowed operator long IDs for APEX On-Board Refund transactions.
	 * Only import transactions from these operator IDs.
	 */
	allowed_operator_long_ids: ['1', '4', '21', '41', '42', '43', '44'],

};
