#!/bin/bash
set -e

# Substitute RADIUS_SECRET into clients.conf at runtime
envsubst '${RADIUS_SECRET}' \
  < /etc/freeradius/clients.conf.template \
  > /etc/freeradius/clients.conf

echo "[freeradius] clients.conf written — starting server"
exec freeradius -f "$@"
