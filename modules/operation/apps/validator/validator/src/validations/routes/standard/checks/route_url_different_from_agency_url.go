package routes_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func RouteUrlDifferentAgencyUrl(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "routes_route_url_different_from_agency_url"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("route_url", "routes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the values

	routeUrl, err := db.Routes.Field("route_url")
	if err != nil {
		return err
	}

	agencyID, err := db.Routes.Field("agency_id")
	if err != nil {
		return err
	}

	//
	// 4. Get the agency table

	agency, err := db.Table("agency")
	if err != nil {
		return err
	}

	//
	// 5. Check if the route_url is different from the agency_url

	same, err := agency.ExistsMatching(map[string]string{"agency_id": agencyID, "agency_url": routeUrl})
	if err != nil {
		return err
	}

	if same {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", routeUrl))
		return nil
	}

	//
	// 6. Return success

	return nil
}
