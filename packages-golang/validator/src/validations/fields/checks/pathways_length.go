package fields

import (
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

func LengthField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "pathways", []string{"length", "pathway_mode"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the length value

		value, err := queries.Field(row.Source, "length")
		if err != nil {
			return err
		}

		//
		// 3. Check if the length is required

		if value == "" {
			if context.ShouldIgnore(row) {
				return nil
			}

			modeValue, err := queries.Field(row.Source, "pathway_mode")
			if err != nil {
				return err
			}
			mode, parseErr := strconv.Atoi(modeValue)
			if parseErr == nil && (mode == 1 || mode == 6 || mode == 7) {
				context.AddMessage(row, context.GetTranslatedMessage(row, "recommended"))
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
