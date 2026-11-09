package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

func NetworkIdForeign(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	ready, err := context.RequireTables(ctx, "routes", "route_networks")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "routes", []string{"network_id"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "network_id")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Check if the network_id is foreign

		referenceExists1, err := queries.Exists(&sqliteTypes.SQLiteTable{DB: rowCtx.DB, Name: "route_networks"}, "network_id", value)
		if err != nil {
			return err
		}
		if !referenceExists1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_found", value))
			return nil
		}

		//
		// 3. Return success

		return nil
	})
}
