package keeper_test

import (
	"testing"

	"github.com/stretchr/testify/require"

	keepertest "github.com/pointpay/pointpay/testutil/keeper"
	"github.com/pointpay/pointpay/x/pnp/types"
)

func TestGetParams(t *testing.T) {
	k, ctx := keepertest.PnpKeeper(t)
	params := types.DefaultParams()

	require.NoError(t, k.SetParams(ctx, params))
	require.EqualValues(t, params, k.GetParams(ctx))
}
