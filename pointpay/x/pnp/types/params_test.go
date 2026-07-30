package types

import (
	"testing"

	sdkmath "cosmossdk.io/math"
	"github.com/stretchr/testify/require"
)

func TestDefaultMaxSupply(t *testing.T) {
	require.Equal(t, uint64(10_000_000_000_000), DefaultMaxSupply)
	p := DefaultParams()
	require.NoError(t, p.Validate())
}

func TestMaxSupplyRejectsOtherValues(t *testing.T) {
	p := NewParams(1)
	require.Error(t, p.Validate())
}

func TestSupplyCompare(t *testing.T) {
	max := sdkmath.NewIntFromUint64(DefaultMaxSupply)
	over := max.Add(sdkmath.NewInt(1))
	require.True(t, over.GT(max))
}
