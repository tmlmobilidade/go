/* * */

/**
 * Settings for importing and validating APEX Validation transactions.
 */
export const APEX_VALIDATIONS_SETTINGS = {

	/**
	 * The version type corresponding to APEX Validation
	 * transactions in the PCGI database.
	 * Only import transactions with this type.
	 * @constant `11` Validation transaction
	 */
	allowed_apex_transaction_types: [11],

	/**
	 * List of allowed schema versions for APEX Validation transactions.
	 * Only import transactions with these versions.
	 */
	allowed_apex_transaction_versions: ['2.0', '3.0'],

	/**
	 * List of allowed operator long IDs for APEX Validation transactions.
	 * Only import transactions from these operator IDs.
	 */
	allowed_operator_long_ids: ['1', '4', '21', '41', '42', '43', '44'],

};
