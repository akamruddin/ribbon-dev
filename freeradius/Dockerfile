FROM freeradius/freeradius-server:latest

# envsubst for runtime secret injection into clients.conf
RUN apt-get update && apt-get install -y --no-install-recommends gettext-base \
    && rm -rf /var/lib/apt/lists/*

# SQL module — PostgreSQL backend (overrides the default sqlite config)
COPY mods-sql /etc/freeradius/mods-available/sql
RUN ln -sf /etc/freeradius/mods-available/sql \
           /etc/freeradius/mods-enabled/sql

# Minimal virtual server — SQL + PAP auth
COPY sites-default /etc/freeradius/sites-available/default

# clients.conf template — RADIUS_SECRET injected at startup
COPY clients.conf.template /etc/freeradius/clients.conf.template

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
