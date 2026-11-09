package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
# Attributes

  - File: [stop_times.txt], [booking_rules.txt]
  - Field: pickup_booking_rule_id
  - Presence: Optional
  - Type: Foreign ID referencing booking_rules.booking_rule_id

# Description

Identifies the booking rule for boarding at this stop time. Recommended when pickup_type=2.

Validation: Checks that each non-empty pickup_booking_rule_id exists in booking_rules.booking_rule_id. It compares
the original text without trimming whitespace or normalizing letter case. The presence of the referenced value is
separate from its format. Empty values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard stop_times].

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
[booking_rules.txt]: https://gtfs.org/documentation/schedule/reference/#booking_rulestxt
[GTFS Standard stop_times]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func PickupBookingRuleIdForeign(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	ready, err := context.RequireTables(ctx, "stop_times", "booking_rules")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "stop_times", []string{"pickup_booking_rule_id"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "pickup_booking_rule_id")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Check if the pickup_booking_rule_id is foreign

		referenceExists1, err := queries.Exists(&sqliteTypes.SQLiteTable{DB: rowCtx.DB, Name: "booking_rules"}, "booking_rule_id", value)
		if err != nil {
			return err
		}
		if !referenceExists1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_found", value))
			return nil
		}

		//
		// 3. Return success

		return nil
	})
}
