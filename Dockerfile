# syntax=docker/dockerfile:1

# Stage 1: build the React frontend
FROM node:24.22.1-slim AS frontend-build

WORKDIR /build/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: build the Rails app with production gems
FROM ruby:4.0.9-slim AS backend-build

RUN apt-get update -qq \
 && apt-get install -y --no-install-recommends build-essential libpq-dev \
 && rm -rf /var/lib/apt/lists/*

ENV RAILS_ENV=production \
    BUNDLE_WITHOUT=development:test \
    BUNDLE_DEPLOYMENT=1

WORKDIR /build/backend

COPY backend/Gemfile backend/Gemfile.lock ./
RUN bundle install && rm -rf /usr/local/bundle/cache /usr/local/bundle/ruby/*/cache

COPY backend/ ./

# Stage 3: runtime image
FROM ruby:4.0.9-slim AS runtime

RUN apt-get update -qq \
 && apt-get install -y --no-install-recommends libpq5 \
 && rm -rf /var/lib/apt/lists/* \
 && groupadd --system --gid 1000 app \
 && useradd --system --uid 1000 --gid app --home /app app

ENV RAILS_ENV=production \
    BUNDLE_WITHOUT=development:test \
    BUNDLE_DEPLOYMENT=1 \
    PORT=3000

WORKDIR /app

COPY --from=backend-build /usr/local/bundle /usr/local/bundle
COPY --from=backend-build --chown=app:app /build/backend ./
COPY --from=frontend-build --chown=app:app /build/frontend/dist ./public

RUN mkdir -p tmp log && chown -R app:app tmp log

USER app

EXPOSE 3000

CMD ["bin/rails", "server", "-b", "0.0.0.0"]
