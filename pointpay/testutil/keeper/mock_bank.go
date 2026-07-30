package keeper

import (
	"context"

	sdkmath "cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/pointpay/pointpay/x/pnp/types"
)

type mockBank struct{}

func (mockBank) SpendableCoins(context.Context, sdk.AccAddress) sdk.Coins { return nil }
func (mockBank) GetSupply(context.Context, string) sdk.Coin {
	return sdk.NewCoin(types.BaseDenom, sdkmath.ZeroInt())
}
