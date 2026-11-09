package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

func RouteUrlDifferentAgencyUrl(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	ready, err := context.RequireTables(ctx, "routes", "agency")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "routes", []string{"route_url", "agency_id"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		routeUrl, err := queries.Field(rowCtx.Source, "route_url")
		if err != nil {
			return err
		}
		if routeUrl == "" {
			return nil
		}

		//
		// 2. Get the values

		agencyID, err := queries.Field(rowCtx.Source, "agency_id")
		if err != nil {
			return err
		}

		//
		// 3. Get the agency table

		agency := &sqliteTypes.SQLiteTable{DB: rowCtx.DB, Name: "agency"}

		//
		// 4. Check if the route_url is different from the agency_url

		same, err := queries.ExistsMatching(agency, map[string]string{"agency_id": agencyID, "agency_url": routeUrl})
		if err != nil {
			return err
		}

		if same {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", routeUrl))
			return nil
		}

		//
		// 5. Return success

		return nil
	})
}
