package pnp_test

import (
	"testing"

	keepertest "github.com/pointpay/pointpay/testutil/keeper"
	"github.com/pointpay/pointpay/testutil/nullify"
	pnp "github.com/pointpay/pointpay/x/pnp/module"
	"github.com/pointpay/pointpay/x/pnp/types"
	"github.com/stretchr/testify/require"
)

func TestGenesis(t *testing.T) {
	genesisState := types.GenesisState{
		Params: types.DefaultParams(),

		// this line is used by starport scaffolding # genesis/test/state
	}

	k, ctx := keepertest.PnpKeeper(t)
	pnp.InitGenesis(ctx, k, genesisState)
	got := pnp.ExportGenesis(ctx, k)
	require.NotNil(t, got)

	nullify.Fill(&genesisState)
	nullify.Fill(got)

	// this line is used by starport scaffolding # genesis/test/assert
}
