package test_helpers

import (
	"testing"
)

// ===============================================
// VERIFY TEST CASE GENERATORS INTEGRITY
// ===============================================

func TestVerifyAllTestCasesIntegrity(t *testing.T) {
	VerifyTestCasesIntegrity(t)
}

func TestPrintTestSummary(t *testing.T) {
	summary := PrintTestSummary()
	if summary == "" {
		t.Error("PrintTestSummary should return a non-empty string")
	}
	t.Log(summary)
}

// ===============================================
// AGENCY TEST CASES VERIFICATION
// ===============================================

func TestAgencyIdTestCases(t *testing.T) {
	cases := GetGenericIdTestCases("agency_id")
	if len(cases) == 0 {
		t.Error("AgencyIdTestCases should return test cases")
	}

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			// Verify test case has required fields
			if tc.Name == "" {
				t.Error("Test case name should not be empty")
			}
			if tc.ExpectedErrors < 0 {
				t.Error("ExpectedErrors should be >= 0")
			}
		})
	}
}

func TestAgencyUrlTestCases(t *testing.T) {
	cases := GetGenericUrlTestCases("agency_url")
	if len(cases) == 0 {
		t.Error("AgencyUrlTestCases should return test cases")
	}

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			if tc.Name == "" {
				t.Error("Test case name should not be empty")
			}
		})
	}
}

func TestAgencyTimezoneTestCases(t *testing.T) {
	// Timezone validation uses custom validation logic
	// This test verifies that valid/invalid timezone generators work
	validTimezones := GetValidTimezones()
	invalidTimezones := GetInvalidTimezones()
	if len(validTimezones) == 0 {
		t.Error("ValidTimezones should return values")
	}
	if len(invalidTimezones) == 0 {
		t.Error("InvalidTimezones should return values")
	}
}

func TestAgencyLangTestCases(t *testing.T) {
	// Language code validation uses custom validation logic
	// This test verifies that valid/invalid language code generators work
	validLangs := GetValidLanguageCodes()
	invalidLangs := GetInvalidLanguageCodes()
	if len(validLangs) == 0 {
		t.Error("ValidLanguageCodes should return values")
	}
	if len(invalidLangs) == 0 {
		t.Error("InvalidLanguageCodes should return values")
	}
}

func TestAgencyPhoneTestCases(t *testing.T) {
	// Phone number validation uses custom validation logic
	// This test verifies that valid phone number generators work
	validPhones := GetValidPhoneNumbers()
	if len(validPhones) == 0 {
		t.Error("ValidPhoneNumbers should return values")
	}
}

func TestAgencyEmailTestCases(t *testing.T) {
	// Email validation uses custom validation logic
	// This test verifies that valid/invalid email generators work
	validEmails := GetValidEmails()
	invalidEmails := GetInvalidEmails()
	if len(validEmails) == 0 {
		t.Error("ValidEmails should return values")
	}
	if len(invalidEmails) == 0 {
		t.Error("InvalidEmails should return values")
	}
}

func TestAgencyFareUrlTestCases(t *testing.T) {
	cases := GetGenericUrlTestCases("agency_fare_url")
	if len(cases) == 0 {
		t.Error("AgencyFareUrlTestCases should return test cases")
	}

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			if tc.Name == "" {
				t.Error("Test case name should not be empty")
			}
		})
	}
}

func TestAgencyNameIdMatchTestCases(t *testing.T) {
	// Name-ID match validation uses custom validation logic
	// This test verifies that ID test cases work
	cases := GetGenericIdTestCases("agency_name_id_match")
	if len(cases) == 0 {
		t.Error("AgencyNameIdMatchTestCases should return test cases")
	}

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			if tc.Name == "" {
				t.Error("Test case name should not be empty")
			}
		})
	}
}

func TestParseAgencyTestCases(t *testing.T) {
	// Parse agency test cases are defined in validations/agency/tests package
	// This test is a placeholder for future test case generator verification
	t.Skip("ParseAgencyTestCases generator not yet implemented")
}

// ===============================================
// ROUTES TEST CASES VERIFICATION
// ===============================================

func TestRouteIdTestCases(t *testing.T) {
	cases := GetGenericIdTestCases("route_id")
	if len(cases) == 0 {
		t.Error("RouteIdTestCases should return test cases")
	}

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			if tc.Name == "" {
				t.Error("Test case name should not be empty")
			}
		})
	}
}

func TestRouteTypeTestCases(t *testing.T) {
	validOptions := GetRouteTypeValidOptions()
	cases := GetGenericEnumIntTestCases("route_type", validOptions)
	if len(cases) == 0 {
		t.Error("RouteTypeTestCases should return test cases")
	}

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			if tc.Name == "" {
				t.Error("Test case name should not be empty")
			}
		})
	}
}

func TestRouteUrlTestCases(t *testing.T) {
	cases := GetGenericUrlTestCases("route_url")
	if len(cases) == 0 {
		t.Error("RouteUrlTestCases should return test cases")
	}

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			if tc.Name == "" {
				t.Error("Test case name should not be empty")
			}
		})
	}
}

func TestRouteColorTestCases(t *testing.T) {
	cases := GetGenericColorTestCases("route_color")
	if len(cases) == 0 {
		t.Error("RouteColorTestCases should return test cases")
	}

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			if tc.Name == "" {
				t.Error("Test case name should not be empty")
			}
		})
	}
}

func TestRoutesTextColorTestCases(t *testing.T) {
	cases := GetGenericColorTestCases("route_text_color")
	if len(cases) == 0 {
		t.Error("RoutesTextColorTestCases should return test cases")
	}

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			if tc.Name == "" {
				t.Error("Test case name should not be empty")
			}
		})
	}
}

func TestRouteShortNameTestCases(t *testing.T) {
	cases := GetGenericRequiredFieldTestCases("route_short_name")
	if len(cases) == 0 {
		t.Error("RouteShortNameTestCases should return test cases")
	}

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			if tc.Name == "" {
				t.Error("Test case name should not be empty")
			}
		})
	}
}

func TestRouteLongNameTestCases(t *testing.T) {
	cases := GetGenericRequiredFieldTestCases("route_long_name")
	if len(cases) == 0 {
		t.Error("RouteLongNameTestCases should return test cases")
	}

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			if tc.Name == "" {
				t.Error("Test case name should not be empty")
			}
		})
	}
}

func TestRouteDescTestCases(t *testing.T) {
	cases := GetGenericRequiredFieldTestCases("route_desc")
	if len(cases) == 0 {
		t.Error("RouteDescTestCases should return test cases")
	}

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			if tc.Name == "" {
				t.Error("Test case name should not be empty")
			}
		})
	}
}

func TestRouteSortOrderTestCases(t *testing.T) {
	cases := GetGenericRequiredFieldTestCases("route_sort_order")
	if len(cases) == 0 {
		t.Error("RouteSortOrderTestCases should return test cases")
	}

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			if tc.Name == "" {
				t.Error("Test case name should not be empty")
			}
		})
	}
}

func TestRoutesAgencyIdTestCases(t *testing.T) {
	cases := GetGenericIdTestCases("routes_agency_id")
	if len(cases) == 0 {
		t.Error("RoutesAgencyIdTestCases should return test cases")
	}

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			if tc.Name == "" {
				t.Error("Test case name should not be empty")
			}
		})
	}
}

func TestRoutesContinuousPickupTestCases(t *testing.T) {
	validOptions := GetFourStateValidOptions()
	cases := GetGenericEnumIntTestCases("continuous_pickup", validOptions)
	if len(cases) == 0 {
		t.Error("RoutesContinuousPickupTestCases should return test cases")
	}

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			if tc.Name == "" {
				t.Error("Test case name should not be empty")
			}
		})
	}
}

func TestRoutesContinuousDropOffTestCases(t *testing.T) {
	validOptions := GetFourStateValidOptions()
	cases := GetGenericEnumIntTestCases("continuous_drop_off", validOptions)
	if len(cases) == 0 {
		t.Error("RoutesContinuousDropOffTestCases should return test cases")
	}

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			if tc.Name == "" {
				t.Error("Test case name should not be empty")
			}
		})
	}
}

func TestPathTypeTestCases(t *testing.T) {
	// Path type validation uses custom validation logic
	// This test is a placeholder for future test case generator verification
	t.Skip("PathTypeTestCases generator not yet implemented")
}

func TestRoutesNetworkIdTestCases(t *testing.T) {
	cases := GetGenericIdTestCases("routes_network_id")
	if len(cases) == 0 {
		t.Error("RoutesNetworkIdTestCases should return test cases")
	}

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			if tc.Name == "" {
				t.Error("Test case name should not be empty")
			}
		})
	}
}

func TestRoutesParseRoutesTestCases(t *testing.T) {
	// Parse routes test cases are defined in validations/routes/tests package
	// This test is a placeholder for future test case generator verification
	t.Skip("RoutesParseRoutesTestCases generator not yet implemented")
}

// ===============================================
// GENERIC TEST VALUE GENERATORS VERIFICATION
// ===============================================

func TestGenericTestValueGenerators(t *testing.T) {
	t.Run("ValidTimezones", func(t *testing.T) {
		timezones := GetValidTimezones()
		if len(timezones) == 0 {
			t.Error("ValidTimezones should return values")
		}
	})

	t.Run("InvalidTimezones", func(t *testing.T) {
		timezones := GetInvalidTimezones()
		if len(timezones) == 0 {
			t.Error("InvalidTimezones should return values")
		}
	})

	t.Run("ValidLanguageCodes", func(t *testing.T) {
		langs := GetValidLanguageCodes()
		if len(langs) == 0 {
			t.Error("ValidLanguageCodes should return values")
		}
	})

	t.Run("InvalidLanguageCodes", func(t *testing.T) {
		langs := GetInvalidLanguageCodes()
		if len(langs) == 0 {
			t.Error("InvalidLanguageCodes should return values")
		}
	})

	t.Run("ValidEmails", func(t *testing.T) {
		emails := GetValidEmails()
		if len(emails) == 0 {
			t.Error("ValidEmails should return values")
		}
	})

	t.Run("InvalidEmails", func(t *testing.T) {
		emails := GetInvalidEmails()
		if len(emails) == 0 {
			t.Error("InvalidEmails should return values")
		}
	})

	t.Run("ValidPhoneNumbers", func(t *testing.T) {
		phones := GetValidPhoneNumbers()
		if len(phones) == 0 {
			t.Error("ValidPhoneNumbers should return values")
		}
	})

	t.Run("ValidUrls", func(t *testing.T) {
		urls := GetValidUrls()
		if len(urls) == 0 {
			t.Error("ValidUrls should return values")
		}
	})

	t.Run("InvalidUrls", func(t *testing.T) {
		urls := GetInvalidUrls()
		if len(urls) == 0 {
			t.Error("InvalidUrls should return values")
		}
	})
}

// ===============================================
// GTFS VALID OPTIONS VERIFICATION
// ===============================================

func TestGTFSValidOptionsGenerators(t *testing.T) {
	t.Run("RouteTypeValidOptions", func(t *testing.T) {
		opts := GetRouteTypeValidOptions()
		if len(opts) == 0 {
			t.Error("RouteTypeValidOptions should return values")
		}
		// Verify common route types are present
		expected := []int{0, 1, 2, 3}
		for _, e := range expected {
			found := false
			for _, o := range opts {
				if o == e {
					found = true
					break
				}
			}
			if !found {
				t.Errorf("RouteTypeValidOptions should contain %d", e)
			}
		}
	})

	t.Run("ContinuousPickupDropOffValidOptions", func(t *testing.T) {
		opts := GetFourStateValidOptions()
		if len(opts) != 4 {
			t.Errorf("ContinuousPickupDropOffValidOptions should have 4 values, got %d", len(opts))
		}
	})

	t.Run("PickupTypeValidOptions", func(t *testing.T) {
		opts := GetFourStateValidOptions()
		if len(opts) != 4 {
			t.Errorf("PickupTypeValidOptions should have 4 values, got %d", len(opts))
		}
	})

	t.Run("DropOffTypeValidOptions", func(t *testing.T) {
		opts := GetFourStateValidOptions()
		if len(opts) != 4 {
			t.Errorf("DropOffTypeValidOptions should have 4 values, got %d", len(opts))
		}
	})

	t.Run("TimepointValidOptions", func(t *testing.T) {
		opts := GetBinaryValidOptions()
		if len(opts) != 2 {
			t.Errorf("TimepointValidOptions should have 2 values, got %d", len(opts))
		}
	})

	t.Run("LocationTypeValidOptions", func(t *testing.T) {
		opts := GetLocationTypeValidOptions()
		if len(opts) != 5 {
			t.Errorf("LocationTypeValidOptions should have 5 values, got %d", len(opts))
		}
	})

	t.Run("WheelchairBoardingValidOptions", func(t *testing.T) {
		opts := GetThreeStateValidOptions()
		if len(opts) != 3 {
			t.Errorf("WheelchairBoardingValidOptions should have 3 values, got %d", len(opts))
		}
	})

	t.Run("BikesAllowedValidOptions", func(t *testing.T) {
		opts := GetThreeStateValidOptions()
		if len(opts) != 3 {
			t.Errorf("BikesAllowedValidOptions should have 3 values, got %d", len(opts))
		}
	})

	t.Run("DirectionIdValidOptions", func(t *testing.T) {
		opts := GetBinaryValidOptions()
		if len(opts) != 2 {
			t.Errorf("DirectionIdValidOptions should have 2 values, got %d", len(opts))
		}
	})

	t.Run("ExceptionTypeValidOptions", func(t *testing.T) {
		opts := GetBinaryValidOptions()
		if len(opts) != 2 {
			t.Errorf("ExceptionTypeValidOptions should have 2 values, got %d", len(opts))
		}
	})
}

// ===============================================
// TEST CASE COUNT SUMMARY
// ===============================================

func TestTestCaseSummary(t *testing.T) {
	summary := GetTestCaseSummary()

	if summary.TotalCases == 0 {
		t.Error("TotalCases should be greater than 0")
	}

	expectedTotal := summary.RequiredFieldCases + summary.UrlCases + summary.ColorCases +
		summary.EnumCases + summary.IdCases + summary.FkCases + summary.SeverityCases

	if summary.TotalCases != expectedTotal {
		t.Errorf("TotalCases (%d) should equal sum of all categories (%d)", summary.TotalCases, expectedTotal)
	}

	t.Logf("Test Case Summary:\n"+
		"  Required Field: %d\n"+
		"  URL: %d\n"+
		"  Color: %d\n"+
		"  Enum: %d\n"+
		"  ID: %d\n"+
		"  FK: %d\n"+
		"  Severity: %d\n"+
		"  Total: %d\n",
		summary.RequiredFieldCases,
		summary.UrlCases,
		summary.ColorCases,
		summary.EnumCases,
		summary.IdCases,
		summary.FkCases,
		summary.SeverityCases,
		summary.TotalCases,
	)
}

// ===============================================
// ALL TEST CASES COUNT (Comprehensive check)
// ===============================================

func TestAllTestCasesCount(t *testing.T) {
	var totalCases int

	// Agency test cases (using generic generators)
	totalCases += len(GetGenericIdTestCases("agency_id"))
	totalCases += len(GetGenericUrlTestCases("agency_url"))
	totalCases += len(GetGenericUrlTestCases("agency_fare_url"))
	totalCases += len(GetGenericIdTestCases("agency_name_id_match"))

	// Routes test cases (using generic generators)
	totalCases += len(GetGenericIdTestCases("route_id"))
	validRouteTypeOptions := GetRouteTypeValidOptions()
	totalCases += len(GetGenericEnumIntTestCases("route_type", validRouteTypeOptions))
	totalCases += len(GetGenericUrlTestCases("route_url"))
	totalCases += len(GetGenericColorTestCases("route_color"))
	totalCases += len(GetGenericColorTestCases("route_text_color"))
	totalCases += len(GetGenericRequiredFieldTestCases("route_short_name"))
	totalCases += len(GetGenericRequiredFieldTestCases("route_long_name"))
	totalCases += len(GetGenericRequiredFieldTestCases("route_desc"))
	totalCases += len(GetGenericRequiredFieldTestCases("route_sort_order"))
	totalCases += len(GetGenericIdTestCases("routes_agency_id"))
	validContinuousOptions := GetFourStateValidOptions()
	totalCases += len(GetGenericEnumIntTestCases("continuous_pickup", validContinuousOptions))
	totalCases += len(GetGenericEnumIntTestCases("continuous_drop_off", validContinuousOptions))
	totalCases += len(GetGenericIdTestCases("routes_network_id"))

	// Generic test cases
	genericSummary := GetTestCaseSummary()
	totalCases += genericSummary.TotalCases

	t.Logf("\n===========================================")
	t.Logf("       TOTAL TEST CASES AVAILABLE")
	t.Logf("===========================================")
	t.Logf(" Agency Test Cases:   %d",
		len(GetGenericIdTestCases("agency_id"))+
			len(GetGenericUrlTestCases("agency_url"))+
			len(GetGenericUrlTestCases("agency_fare_url"))+
			len(GetGenericIdTestCases("agency_name_id_match")))
	t.Logf(" Routes Test Cases:   %d",
		len(GetGenericIdTestCases("route_id"))+
			len(GetGenericEnumIntTestCases("route_type", validRouteTypeOptions))+
			len(GetGenericUrlTestCases("route_url"))+
			len(GetGenericColorTestCases("route_color"))+
			len(GetGenericColorTestCases("route_text_color"))+
			len(GetGenericRequiredFieldTestCases("route_short_name"))+
			len(GetGenericRequiredFieldTestCases("route_long_name"))+
			len(GetGenericRequiredFieldTestCases("route_desc"))+
			len(GetGenericRequiredFieldTestCases("route_sort_order"))+
			len(GetGenericIdTestCases("routes_agency_id"))+
			len(GetGenericEnumIntTestCases("continuous_pickup", validContinuousOptions))+
			len(GetGenericEnumIntTestCases("continuous_drop_off", validContinuousOptions))+
			len(GetGenericIdTestCases("routes_network_id")))
	t.Logf(" Generic Test Cases:  %d", genericSummary.TotalCases)
	t.Logf("-------------------------------------------")
	t.Logf(" GRAND TOTAL:         %d", totalCases)
	t.Logf("===========================================\n")

	if totalCases == 0 {
		t.Error("Total test cases should be greater than 0")
	}
}
