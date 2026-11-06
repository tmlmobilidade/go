package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

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
