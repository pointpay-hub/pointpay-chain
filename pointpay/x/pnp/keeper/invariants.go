package keeper

import (
	"fmt"

	sdkmath "cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/pointpay/pointpay/x/pnp/types"
)

const SupplyInvariant = "pnp-supply"

// RegisterInvariants registers PNP supply invariants.
func RegisterInvariants(ir sdk.InvariantRegistry, k Keeper) {
	ir.RegisterRoute(types.ModuleName, SupplyInvariant, SupplyInvariantFn(k))
}

// SupplyInvariantFn: upnp total supply must never exceed MaxSupply param.
func SupplyInvariantFn(k Keeper) sdk.Invariant {
	return func(ctx sdk.Context) (string, bool) {
		params := k.GetParams(ctx)
		supply := k.bankKeeper.GetSupply(ctx, types.BaseDenom)
		max := sdkmath.NewIntFromUint64(params.MaxSupply)
		broken := supply.Amount.GT(max)
		msg := fmt.Sprintf(
			"pnp supply invariant\nmax=%d upnp\nsupply=%s\n",
			params.MaxSupply,
			supply.String(),
		)
		return sdk.FormatInvariant(types.ModuleName, SupplyInvariant, msg), broken
	}
}
