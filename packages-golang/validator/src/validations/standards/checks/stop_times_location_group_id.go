package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

func LocationGroupIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "stop_times", []string{"location_group_id"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the location_group_id value

		value, err := queries.Field(row.Source, "location_group_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if stop_id or location_id is defined

		for _, field := range []string{"stop_id", "location_id"} {
			exists, err := queries.Exists(row.Source.Table, field, value)
			if err != nil {
				return err
			}
			if exists {
				context.AddMessage(row, context.GetTranslatedMessage(row, "forbidden_stop_location"))
				return nil
			}
		}

		//
		// 4. Return success

		return nil
	})
}
