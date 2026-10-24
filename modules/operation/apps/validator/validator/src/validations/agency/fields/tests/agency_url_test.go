package agency_fields_test

import (
	"main/types"
	checks "main/validations/agency/fields/checks"
	testutils "main/validations/agency/utils"
	"testing"
)

func TestAgencyUrlField(t *testing.T) {
	testutils.CheckPresence(t, "agency_url", checks.AgencyUrlField, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_url_field": config}
	})
}
