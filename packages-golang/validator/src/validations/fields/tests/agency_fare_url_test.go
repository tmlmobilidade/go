package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestAgencyFareUrlField(t *testing.T) {
	validationutils.AgencyCheckPresence(t, "agency_fare_url", fields.AgencyFareUrlField, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_fare_url_field": config}
	})
}
