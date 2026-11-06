package custom

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/utils"
)

func PathTypeValid(ctx *context.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "routes")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "routes", []string{"path_type"}, func(rowCtx *context.ValidationContext) error {
		//
		// 2. Get the path_type value

		value, err := queries.Field(rowCtx.Source, "path_type")
		if err != nil {
			return err
		}

		//
		// 3. Check if the path_type is valid

		if value != "1" && value != "2" && value != "3" {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_valid", value))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
