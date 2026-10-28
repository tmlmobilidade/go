package agency_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/utils"
	"main/types"
	"testing"
)

func TestAgencyFareUrlField(t *testing.T) {
	testutils.CheckPresence(t, "agency_fare_url", checks.AgencyFareUrlField, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_fare_url_field": config}
	})
}
