package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
)

func PathwayModeField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "pathways", []string{"pathway_mode"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the pathway_mode value

		value, err := queries.Field(row.Source, "pathway_mode")
		if err != nil {
			return err
		}

		//
		// 3. Check if the pathway_mode is required

		if value == "" {
			if context.ShouldIgnore(row) {
				return nil
			}

			context.AddMessage(row, context.GetSeverityMessage(row, "required", "recommended", "informational"))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
