package keeper

import (
	"github.com/pointpay/pointpay/x/pnp/types"
)

var _ types.QueryServer = Keeper{}
