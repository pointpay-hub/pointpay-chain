# PointPay Chain (testnet / builder image)
FROM golang:1.22-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends curl git ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV IGNITE_VERSION=v28.11.2
RUN curl -sL "https://get.ignite.com/cli@${IGNITE_VERSION}!" | bash \
  && mv ignite /usr/local/bin/ignite || true

WORKDIR /chain
COPY . /chain

# Default: print security posture. Build with: docker run ... bash scripts/bootstrap-linux.sh
CMD ["head", "-n", "40", "SECURITY.md"]
