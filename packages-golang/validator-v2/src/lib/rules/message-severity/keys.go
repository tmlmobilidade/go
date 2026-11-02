package message_severity

// ruleMessageKeys maps field-specific configuration IDs to shared diagnostic IDs.
var ruleMessageKeys = map[string]string{
	"calendar_start_date_valid_yyyymmdd": "calendar_start_end_dates_valid_yyyymmdd_order/start_date",
	"calendar_end_date_valid_yyyymmdd":   "calendar_start_end_dates_valid_yyyymmdd_order/end_date",
}

// RuleMessageKey returns the diagnostic key controlled by a configuration rule ID.
func RuleMessageKey(id string) string {
	//
	// 1. Resolve a field-specific alias or retain the original rule ID

	if key, exists := ruleMessageKeys[id]; exists {
		return key
	}
	return id
}
