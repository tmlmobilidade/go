package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

func StopTimesStopIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "stop_times", []string{"stop_id"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the stop_id value

		value, err := queries.Field(row.Source, "stop_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the stop_id is required

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
