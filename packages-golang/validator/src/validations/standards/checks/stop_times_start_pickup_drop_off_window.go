package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
)

func StartPickupDropOffWindowField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "stop_times", []string{"start_pickup_drop_off_window", "arrival_time", "departure_time"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the start_pickup_drop_off_window value

		values, err := queries.Fields(row.Source, "start_pickup_drop_off_window", "arrival_time", "departure_time")
		if err != nil {
			return err
		}

		//
		// 3. Check if the start_pickup_drop_off_window is required

		if values["start_pickup_drop_off_window"] == "" && values["arrival_time"] == "" && values["departure_time"] == "" {
			if context.ShouldSkip(row) {
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
