package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestAgencyUrlField(t *testing.T) {
	validationutils.AgencyCheckPresence(t, "agency_url", fields.AgencyUrlField, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_url_field": config}
	})
}
