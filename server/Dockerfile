# Strudel Together room server. Works on any container host (Render, Fly.io,
# Railway, ...). Mount a persistent volume at /data to keep rooms across
# restarts.
FROM node:24-slim
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npx -y pnpm@9.11.0 install --frozen-lockfile --prod
COPY index.ts ./
ENV PORT=1234 \
    DB_PATH=/data/rooms.sqlite
EXPOSE 1234
CMD ["node", "index.ts"]
