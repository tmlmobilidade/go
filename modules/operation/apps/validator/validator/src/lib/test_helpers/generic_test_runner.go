package test_helpers

import (
	"fmt"
	"main/types"
	"testing"
)

// ===============================================
// TEST RUNNER TYPES
// ===============================================

// ValidationFunc is a generic validation function type
type ValidationFunc func(value interface{}, row int, rules interface{}) (errors int, warnings int)

// TestResult represents the result of a single test case
type TestResult struct {
	TestName     string
	Passed       bool
	Expected     string
	Actual       string
	ErrorMessage string
}

// TestSuiteResult represents the result of an entire test suite
type TestSuiteResult struct {
	SuiteName    string
	TotalTests   int
	PassedTests  int
	FailedTests  int
	SkippedTests int
	Results      []TestResult
}

// ===============================================
// GENERIC TEST RUNNER
// ===============================================

// RunGenericRequiredFieldTests runs all required field test cases
func RunGenericRequiredFieldTests(t *testing.T, fieldName string, validateFunc func(value *string, row int) (errors int, warnings int)) {
	t.Helper()

	cases := GetGenericRequiredFieldTestCases(fieldName)

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			errors, warnings := validateFunc(tc.Value, tc.Row)

			if errors != tc.ExpectedErrors {
				t.Errorf("%s: expected %d errors, got %d", tc.Name, tc.ExpectedErrors, errors)
			}
			if warnings != tc.ExpectedWarnings {
				t.Errorf("%s: expected %d warnings, got %d", tc.Name, tc.ExpectedWarnings, warnings)
			}
		})
	}
}

// RunGenericUrlTests runs all URL validation test cases
func RunGenericUrlTests(t *testing.T, fieldName string, validateFunc func(url *string, row int) (errors int, warnings int)) {
	t.Helper()

	cases := GetGenericUrlTestCases(fieldName)

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			errors, warnings := validateFunc(tc.Url, tc.Row)

			if errors != tc.ExpectedErrors {
				t.Errorf("%s: expected %d errors, got %d", tc.Name, tc.ExpectedErrors, errors)
			}
			if warnings != tc.ExpectedWarnings {
				t.Errorf("%s: expected %d warnings, got %d", tc.Name, tc.ExpectedWarnings, warnings)
			}
		})
	}
}

// RunGenericColorTests runs all color validation test cases
func RunGenericColorTests(t *testing.T, fieldName string, validateFunc func(color *string, row int) (errors int, warnings int)) {
	t.Helper()

	cases := GetGenericColorTestCases(fieldName)

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			errors, warnings := validateFunc(tc.Color, tc.Row)

			if errors != tc.ExpectedErrors {
				t.Errorf("%s: expected %d errors, got %d", tc.Name, tc.ExpectedErrors, errors)
			}
			if warnings != tc.ExpectedWarnings {
				t.Errorf("%s: expected %d warnings, got %d", tc.Name, tc.ExpectedWarnings, warnings)
			}
		})
	}
}

// RunGenericEnumTests runs all enum validation test cases
func RunGenericEnumTests(t *testing.T, fieldName string, validOptions []int, validateFunc func(value *int, row int) (errors int, warnings int)) {
	t.Helper()

	cases := GetGenericEnumIntTestCases(fieldName, validOptions)

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			var val *int
			if tc.Value != nil {
				if ptr, ok := tc.Value.(*int); ok {
					val = ptr
				}
			}

			errors, warnings := validateFunc(val, tc.Row)

			if errors != tc.ExpectedErrors {
				t.Errorf("%s: expected %d errors, got %d", tc.Name, tc.ExpectedErrors, errors)
			}
			if warnings != tc.ExpectedWarnings {
				t.Errorf("%s: expected %d warnings, got %d", tc.Name, tc.ExpectedWarnings, warnings)
			}
		})
	}
}

// RunGenericEnumFloat32Tests runs all float32 enum validation test cases
func RunGenericEnumFloat32Tests(t *testing.T, fieldName string, validOptions []float32, validateFunc func(value *float32, row int) (errors int, warnings int)) {
	t.Helper()

	cases := GetGenericEnumFloat32TestCases(fieldName, validOptions)

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			errors, warnings := validateFunc(tc.Value, tc.Row)

			if errors != tc.ExpectedErrors {
				t.Errorf("%s: expected %d errors, got %d", tc.Name, tc.ExpectedErrors, errors)
			}
			if warnings != tc.ExpectedWarnings {
				t.Errorf("%s: expected %d warnings, got %d", tc.Name, tc.ExpectedWarnings, warnings)
			}
		})
	}
}

// RunGenericEnumFloat64Tests runs all float64 enum validation test cases
func RunGenericEnumFloat64Tests(t *testing.T, fieldName string, validOptions []float64, validateFunc func(value *float64, row int) (errors int, warnings int)) {
	t.Helper()

	cases := GetGenericEnumFloat64TestCases(fieldName, validOptions)

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			errors, warnings := validateFunc(tc.Value, tc.Row)

			if errors != tc.ExpectedErrors {
				t.Errorf("%s: expected %d errors, got %d", tc.Name, tc.ExpectedErrors, errors)
			}
			if warnings != tc.ExpectedWarnings {
				t.Errorf("%s: expected %d warnings, got %d", tc.Name, tc.ExpectedWarnings, warnings)
			}
		})
	}
}

// RunGenericIdTests runs all ID validation test cases
func RunGenericIdTests(t *testing.T, fieldName string, validateFunc func(id *string, row int, existingIds map[string][]int) (errors int)) {
	t.Helper()

	cases := GetGenericIdTestCases(fieldName)

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			errors := validateFunc(tc.Id, tc.Row, tc.ExistingIds)

			if errors != tc.ExpectedErrors {
				t.Errorf("%s: expected %d errors, got %d", tc.Name, tc.ExpectedErrors, errors)
			}
		})
	}
}

// RunGenericSeverityTests runs all severity level test cases
func RunGenericSeverityTests(t *testing.T, fieldName string, validateFunc func(value interface{}, severity types.Severity, row int) (errors int, warnings int)) {
	t.Helper()

	cases := GetGenericSeverityTestCases(fieldName)

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			errors, warnings := validateFunc(tc.Value, tc.Severity, tc.Row)

			if errors != tc.ExpectedErrors {
				t.Errorf("%s: expected %d errors, got %d", tc.Name, tc.ExpectedErrors, errors)
			}
			if warnings != tc.ExpectedWarnings {
				t.Errorf("%s: expected %d warnings, got %d", tc.Name, tc.ExpectedWarnings, warnings)
			}
		})
	}
}

// ===============================================
// BULK TEST RUNNER (Run all tests at once)
// ===============================================

// AllTestCasesConfig holds configuration for running all test types
type AllTestCasesConfig struct {
	FieldName string

	// Function pointers for each validation type
	RequiredFieldValidator func(value *string, row int) (errors int, warnings int)
	UrlValidator           func(url *string, row int) (errors int, warnings int)
	ColorValidator         func(color *string, row int) (errors int, warnings int)
	EnumValidator          func(value *int, row int) (errors int, warnings int)
	IdValidator            func(id *string, row int, existingIds map[string][]int) (errors int)
	SeverityValidator      func(value interface{}, severity types.Severity, row int) (errors int, warnings int)

	// Options for enum validation
	EnumValidOptions []int

	// Whether URL is required
	UrlIsRequired bool
}

// RunAllGenericTests runs all applicable test types based on provided validators
func RunAllGenericTests(t *testing.T, config AllTestCasesConfig) {
	t.Helper()

	if config.RequiredFieldValidator != nil {
		t.Run("RequiredField", func(t *testing.T) {
			RunGenericRequiredFieldTests(t, config.FieldName, config.RequiredFieldValidator)
		})
	}

	if config.UrlValidator != nil {
		t.Run("UrlValidation", func(t *testing.T) {
			RunGenericUrlTests(t, config.FieldName, config.UrlValidator)
		})
	}

	if config.ColorValidator != nil {
		t.Run("ColorValidation", func(t *testing.T) {
			RunGenericColorTests(t, config.FieldName, config.ColorValidator)
		})
	}

	if config.EnumValidator != nil && len(config.EnumValidOptions) > 0 {
		t.Run("EnumValidation", func(t *testing.T) {
			RunGenericEnumTests(t, config.FieldName, config.EnumValidOptions, config.EnumValidator)
		})
	}

	if config.IdValidator != nil {
		t.Run("IdValidation", func(t *testing.T) {
			RunGenericIdTests(t, config.FieldName, config.IdValidator)
		})
	}

	if config.SeverityValidator != nil {
		t.Run("SeverityValidation", func(t *testing.T) {
			RunGenericSeverityTests(t, config.FieldName, config.SeverityValidator)
		})
	}
}

// ===============================================
// TEST CASE VERIFICATION (Smoke Tests)
// ===============================================

// VerifyTestCasesIntegrity verifies that all test case generators return valid data
func VerifyTestCasesIntegrity(t *testing.T) {
	t.Helper()

	t.Run("RequiredFieldTestCases", func(t *testing.T) {
		cases := GetGenericRequiredFieldTestCases("test_field")
		if len(cases) == 0 {
			t.Error("RequiredFieldTestCases should return at least one test case")
		}
		for _, tc := range cases {
			if tc.Name == "" {
				t.Error("Test case name should not be empty")
			}
		}
	})

	t.Run("UrlTestCases", func(t *testing.T) {
		cases := GetGenericUrlTestCases("test_url")
		if len(cases) == 0 {
			t.Error("UrlTestCases should return at least one test case")
		}
		for _, tc := range cases {
			if tc.Name == "" {
				t.Error("Test case name should not be empty")
			}
		}
	})

	t.Run("ColorTestCases", func(t *testing.T) {
		cases := GetGenericColorTestCases("test_color")
		if len(cases) == 0 {
			t.Error("ColorTestCases should return at least one test case")
		}
		for _, tc := range cases {
			if tc.Name == "" {
				t.Error("Test case name should not be empty")
			}
		}
	})

	t.Run("EnumTestCases", func(t *testing.T) {
		cases := GetGenericEnumIntTestCases("test_enum", []int{0, 1, 2})
		if len(cases) == 0 {
			t.Error("EnumTestCases should return at least one test case")
		}
		for _, tc := range cases {
			if tc.Name == "" {
				t.Error("Test case name should not be empty")
			}
		}
	})

	t.Run("IdTestCases", func(t *testing.T) {
		cases := GetGenericIdTestCases("test_id")
		if len(cases) == 0 {
			t.Error("IdTestCases should return at least one test case")
		}
		for _, tc := range cases {
			if tc.Name == "" {
				t.Error("Test case name should not be empty")
			}
		}
	})

	t.Run("SeverityTestCases", func(t *testing.T) {
		cases := GetGenericSeverityTestCases("test_severity")
		if len(cases) == 0 {
			t.Error("SeverityTestCases should return at least one test case")
		}
		for _, tc := range cases {
			if tc.Name == "" {
				t.Error("Test case name should not be empty")
			}
		}
	})

	t.Run("GTFSValidOptions", func(t *testing.T) {
		if len(GetRouteTypeValidOptions()) == 0 {
			t.Error("RouteTypeValidOptions should not be empty")
		}
		if len(GetFourStateValidOptions()) == 0 {
			t.Error("ContinuousPickupDropOffValidOptions should not be empty")
		}
		if len(GetFourStateValidOptions()) == 0 {
			t.Error("PickupTypeValidOptions should not be empty")
		}
		if len(GetLocationTypeValidOptions()) == 0 {
			t.Error("LocationTypeValidOptions should not be empty")
		}
	})

	t.Run("CommonTestValues", func(t *testing.T) {
		if len(GetValidTimezones()) == 0 {
			t.Error("ValidTimezones should not be empty")
		}
		if len(GetInvalidTimezones()) == 0 {
			t.Error("InvalidTimezones should not be empty")
		}
		if len(GetValidLanguageCodes()) == 0 {
			t.Error("ValidLanguageCodes should not be empty")
		}
		if len(GetInvalidLanguageCodes()) == 0 {
			t.Error("InvalidLanguageCodes should not be empty")
		}
		if len(GetValidEmails()) == 0 {
			t.Error("ValidEmails should not be empty")
		}
		if len(GetInvalidEmails()) == 0 {
			t.Error("InvalidEmails should not be empty")
		}
		if len(GetValidUrls()) == 0 {
			t.Error("ValidUrls should not be empty")
		}
		if len(GetInvalidUrls()) == 0 {
			t.Error("InvalidUrls should not be empty")
		}
	})
}

// ===============================================
// TEST SUMMARY PRINTER
// ===============================================

// PrintTestSummary prints a summary of available test cases
func PrintTestSummary() string {
	summary := GetTestCaseSummary()

	return fmt.Sprintf(`
===========================================
       GENERIC TEST CASES SUMMARY
===========================================
Required Field Tests:  %d
URL Validation Tests:  %d
Color Validation Tests: %d
Enum Validation Tests: %d
ID Validation Tests:   %d
Severity Tests:        %d
-------------------------------------------
TOTAL TEST CASES:      %d
===========================================
`,
		summary.RequiredFieldCases,
		summary.UrlCases,
		summary.ColorCases,
		summary.EnumCases,
		summary.IdCases,
		summary.SeverityCases,
		summary.TotalCases,
	)
}
