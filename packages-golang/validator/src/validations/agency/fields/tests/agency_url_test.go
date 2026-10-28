package agency_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/utils"
	"main/types"
	"testing"
)

func TestAgencyUrlField(t *testing.T) {
	testutils.CheckPresence(t, "agency_url", checks.AgencyUrlField, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_url_field": config}
	})
}
