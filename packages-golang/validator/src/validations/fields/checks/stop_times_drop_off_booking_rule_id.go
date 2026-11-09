package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: drop_off_booking_rule_id
  - Presence: Optional
  - Type: Foreign ID referencing booking_rules.booking_rule_id

# Description

Identifies the booking rule for alighting at this stop time. Recommended when drop_off_type=2.

Presence and type follow [GTFS Standard].

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func DropOffBookingRuleIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "stop_times", []string{"drop_off_booking_rule_id"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the drop_off_booking_rule_id value

		value, err := queries.Field(row.Source, "drop_off_booking_rule_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the drop_off_booking_rule_id is required

		if value == "" {
			if context.ShouldIgnore(row) {
				return nil
			}

			message := context.GetSeverityMessage(row, "required", "recommended", "informational")
			context.AddMessage(row, message)
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
