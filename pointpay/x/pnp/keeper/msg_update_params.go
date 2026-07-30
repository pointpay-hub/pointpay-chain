package keeper

import (
	"context"

	errorsmod "cosmossdk.io/errors"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/pointpay/pointpay/x/pnp/types"
)

func (k msgServer) UpdateParams(goCtx context.Context, req *types.MsgUpdateParams) (*types.MsgUpdateParamsResponse, error) {
	if k.GetAuthority() != req.Authority {
		return nil, errorsmod.Wrapf(types.ErrInvalidSigner, "invalid authority; expected %s, got %s", k.GetAuthority(), req.Authority)
	}

	ctx := sdk.UnwrapSDKContext(goCtx)
	// Max supply is immutable after genesis (SECURITY.md).
	cur := k.GetParams(ctx)
	if req.Params.MaxSupply != cur.MaxSupply || req.Params.MaxSupply != types.DefaultMaxSupply {
		return nil, errorsmod.Wrapf(types.ErrInvalidSigner, "max supply is immutable (want %d)", types.DefaultMaxSupply)
	}
	if err := k.SetParams(ctx, req.Params); err != nil {
		return nil, err
	}

	return &types.MsgUpdateParamsResponse{}, nil
}
