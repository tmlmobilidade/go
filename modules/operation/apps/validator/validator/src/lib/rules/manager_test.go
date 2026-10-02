package rules

import (
	"slices"
	"testing"
)

// ruleWith builds a rule that records its execution and returns the given status
func ruleWith(id string, result Status, ran *[]string, deps ...string) Rule[int] {
	return Rule[int]{
		ID:        id,
		DependsOn: deps,
		Run: func(int) Status {
			*ran = append(*ran, id)
			return result
		},
	}
}

func TestOrderFollowsDependencies(t *testing.T) {
	ran := []string{}
	// Registered in reverse on purpose
	m, err := NewManager(
		ruleWith("c", Passed, &ran, "b"),
		ruleWith("b", Passed, &ran, "a"),
		ruleWith("a", Passed, &ran),
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
	m, err := NewManager(
		ruleWith("x", Passed, &ran),
		ruleWith("y", Passed, &ran),
		ruleWith("z", Passed, &ran),
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
	m, _ := NewManager(
		ruleWith("a", Failed, &ran),
		ruleWith("b", Passed, &ran, "a"),
		ruleWith("c", Passed, &ran, "b"),
	)
	status := m.RunRow(0)
	if status["a"] != Failed || status["b"] != Skipped || status["c"] != Skipped {
		t.Fatalf("status = %v", status)
	}
	if !slices.Equal(ran, []string{"a"}) {
		t.Fatalf("ran = %v", ran)
	}
}

// Diamond: match depends on id and name, both depend on file
func TestDiamondSkipsOnlyDependents(t *testing.T) {
	ran := []string{}
	m, _ := NewManager(
		ruleWith("file", Passed, &ran),
		ruleWith("id", Passed, &ran, "file"),
		ruleWith("name", Failed, &ran, "file"),
		ruleWith("match", Passed, &ran, "id", "name"),
		ruleWith("url", Passed, &ran, "file"),
	)
	status := m.RunRow(0)
	want := map[string]Status{"file": Passed, "id": Passed, "name": Failed, "match": Skipped, "url": Passed}
	for id, s := range want {
		if status[id] != s {
			t.Errorf("%s = %v, want %v", id, status[id], s)
		}
	}
}

func TestCycleIsRejected(t *testing.T) {
	ran := []string{}
	_, err := NewManager(
		ruleWith("a", Passed, &ran, "b"),
		ruleWith("b", Passed, &ran, "a"),
	)
	if err == nil {
		t.Fatal("expected cycle error")
	}
}

func TestUnknownDependencyIsRejected(t *testing.T) {
	ran := []string{}
	_, err := NewManager(ruleWith("a", Passed, &ran, "missing"))
	if err == nil {
		t.Fatal("expected unknown dependency error")
	}
}

func TestDuplicateIdIsRejected(t *testing.T) {
	ran := []string{}
	_, err := NewManager(ruleWith("a", Passed, &ran), ruleWith("a", Passed, &ran))
	if err == nil {
		t.Fatal("expected duplicate id error")
	}
}
