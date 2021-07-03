# Build container
FROM node:current-alpine as build

# Working directory
WORKDIR /src

# Copy source code
COPY . .

# Install dependencies
ENV NODE_ENV=development
RUN yarn install --legacy-peer-deps

# Build GraphCTF
RUN yarn run build

# Server container
FROM node:current-alpine

# Create a system user
RUN addgroup -S nodejs && adduser -S graphctf -G nodejs

# Working directory
WORKDIR /app
RUN chown graphctf:nodejs /app

# Copy build
COPY --chown=graphctf:nodejs --from=build /src/dist dist
COPY --chown=graphctf:nodejs --from=build /src/node_modules node_modules

# Switch to the graphctf user
USER graphctf

# Run in production by default
ARG DOCKER_ENV=production
ENV NODE_ENV=$DOCKER_ENV

# Start GraphCTF directly
CMD ["node", "dist/index.js"]