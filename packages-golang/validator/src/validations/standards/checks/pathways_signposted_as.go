package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

func SignpostedAsField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "pathways", []string{"signposted_as"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the signposted_as value

		value, err := queries.Field(row.Source, "signposted_as")
		if err != nil {
			return err
		}

		//
		// 3. Check if the signposted_as is required

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
