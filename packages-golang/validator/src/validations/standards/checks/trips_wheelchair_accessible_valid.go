package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"slices"
)

func TripsWheelchairAccessibleValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "trips", []string{"wheelchair_accessible"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "wheelchair_accessible")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Parse the wheelchair_accessible value

		validValues := []string{"0", "1", "2"}
		if !slices.Contains(validValues, value) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 3. Return success

		return nil
	})
}
