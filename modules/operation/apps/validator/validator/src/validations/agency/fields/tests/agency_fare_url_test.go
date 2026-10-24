package agency_fields_test

import (
	"main/types"
	checks "main/validations/agency/fields/checks"
	testutils "main/validations/agency/utils"
	"testing"
)

func TestAgencyFareUrlField(t *testing.T) {
	testutils.CheckPresence(t, "agency_fare_url", checks.AgencyFareUrlField, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_fare_url_field": config}
	})
}
