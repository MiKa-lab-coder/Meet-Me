# Image MongoDB custom : bake le script d'init pour éviter le bind mount
# (Coolify convertit les bind mounts en volumes vides)
FROM mongo:6.0
COPY docker/mongo-init.js /docker-entrypoint-initdb.d/mongo-init.js