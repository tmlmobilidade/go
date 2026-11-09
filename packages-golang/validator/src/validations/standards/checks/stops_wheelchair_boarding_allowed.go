package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	variables "github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
	"slices"
)

func WheelchairBoardingAllowed(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stops", []string{"wheelchair_boarding"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}
		config := &rowCtx.Config

		value, err := queries.Field(rowCtx.Source, "wheelchair_boarding")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Check if the wheelchair_boarding follows the rule options

		if config.Options != nil {
			if slices.Contains(*config.Options, variables.AllRuleOptions) {
				return nil
			}

			if !slices.Contains(*config.Options, value) {
				context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_allowed", value))
				return nil
			}
		}

		//
		// 3. Return success

		return nil
	})
}
