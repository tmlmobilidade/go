package rules_test

import (
	"main/lib/rules/rules"
	"slices"
	"testing"
)

// ruleWith builds a rule that records its execution and returns the given status
func ruleWith(id string, result rules.Status, ran *[]string, deps ...string) rules.Rule[int] {
	return rules.Rule[int]{
		ID:        id,
		DependsOn: deps,
		Run: func(int) rules.Status {
			*ran = append(*ran, id)
			return result
		},
	}
}

func TestOrderFollowsDependencies(t *testing.T) {
	ran := []string{}
	// Registered in reverse on purpose
	m, err := rules.NewManager(
		ruleWith("c", rules.Passed, &ran, "b"),
		ruleWith("b", rules.Passed, &ran, "a"),
		ruleWith("a", rules.Passed, &ran),
	)
	if err != nil {
		t.Fatal(err)
	}
	if got := m.Order(); !slices.Equal(got, []string{"a", "b", "c"}) {
		t.Fatalf("order = %v", got)
	}
}

func TestOrderIsDeterministicForIndependentRules(t *testing.T) {
	ran := []string{}
	m, err := rules.NewManager(
		ruleWith("x", rules.Passed, &ran),
		ruleWith("y", rules.Passed, &ran),
		ruleWith("z", rules.Passed, &ran),
	)
	if err != nil {
		t.Fatal(err)
	}
	if got := m.Order(); !slices.Equal(got, []string{"x", "y", "z"}) {
		t.Fatalf("order = %v", got)
	}
}

func TestFailureSkipsWholeChain(t *testing.T) {
	ran := []string{}
	m, _ := rules.NewManager(
		ruleWith("a", rules.Failed, &ran),
		ruleWith("b", rules.Passed, &ran, "a"),
		ruleWith("c", rules.Passed, &ran, "b"),
	)
	status := m.RunRow(0)
	if status["a"] != rules.Failed || status["b"] != rules.Skipped || status["c"] != rules.Skipped {
		t.Fatalf("status = %v", status)
	}
	if !slices.Equal(ran, []string{"a"}) {
		t.Fatalf("ran = %v", ran)
	}
}

// Diamond: match depends on id and name, both depend on file
func TestDiamondSkipsOnlyDependents(t *testing.T) {
	ran := []string{}
	m, _ := rules.NewManager(
		ruleWith("file", rules.Passed, &ran),
		ruleWith("id", rules.Passed, &ran, "file"),
		ruleWith("name", rules.Failed, &ran, "file"),
		ruleWith("match", rules.Passed, &ran, "id", "name"),
		ruleWith("url", rules.Passed, &ran, "file"),
	)
	status := m.RunRow(0)
	want := map[string]rules.Status{"file": rules.Passed, "id": rules.Passed, "name": rules.Failed, "match": rules.Skipped, "url": rules.Passed}
	for id, s := range want {
		if status[id] != s {
			t.Errorf("%s = %v, want %v", id, status[id], s)
		}
	}
}

func TestCycleIsRejected(t *testing.T) {
	ran := []string{}
	_, err := rules.NewManager(
		ruleWith("a", rules.Passed, &ran, "b"),
		ruleWith("b", rules.Passed, &ran, "a"),
	)
	if err == nil {
		t.Fatal("expected cycle error")
	}
}

func TestUnknownDependencyIsRejected(t *testing.T) {
	ran := []string{}
	_, err := rules.NewManager(ruleWith("a", rules.Passed, &ran, "missing"))
	if err == nil {
		t.Fatal("expected unknown dependency error")
	}
}

func TestDuplicateIdIsRejected(t *testing.T) {
	ran := []string{}
	_, err := rules.NewManager(ruleWith("a", rules.Passed, &ran), ruleWith("a", rules.Passed, &ran))
	if err == nil {
		t.Fatal("expected duplicate id error")
	}
}
