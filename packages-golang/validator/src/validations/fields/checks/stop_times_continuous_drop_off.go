package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
)

func StopTimesContinuousDropOffField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "stop_times", []string{"continuous_drop_off"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the continuous_drop_off value

		value, err := queries.Field(row.Source, "continuous_drop_off")
		if err != nil {
			return err
		}

		//
		// 3. Check if the continuous_drop_off is required

		if value == "" {
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
