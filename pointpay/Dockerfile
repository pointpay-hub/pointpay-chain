# Build pointpayd in an isolated toolchain (dedicated infra / CI).
# NOT for running consensus on the exchange (tradeone) host.
FROM golang:1.26.5-bookworm AS build

WORKDIR /src
RUN apt-get update && apt-get install -y --no-install-recommends git make ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY go.mod go.sum ./
RUN go mod download

COPY . .
ENV GOTOOLCHAIN=local
RUN make install APPNAME=pointpay VERSION=docker

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && useradd -m -u 1000 pointpay

COPY --from=build /go/bin/pointpayd /usr/local/bin/pointpayd
USER pointpay
WORKDIR /home/pointpay
EXPOSE 26656 26657 1317 9090
ENTRYPOINT ["pointpayd"]
CMD ["version"]
