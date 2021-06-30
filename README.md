# GraphCTF

The only API-driven CTF backend for performant and flexible CTF competitions!

## Features

- Designed with performance in mind, GraphCTF easily scales to thousands of simultaneous users.
- Local instances are stateless, so you can round-robin between instances even without a load balancer.
- Uses GraphQL subscriptions instead of polling for enhanced responsiveness and scalability.
- Bring-your-own-frontend! Need a mobile app for an IRL challenge? Want to give people a command line

## Production
1. Build the Docker image:
```bash
docker build -t graphctf/graphctf:latest .
```
2. Deploy a [MySQL](https://hub.docker.com/_/mysql) and a [Redis](https://hub.docker.com/_/redis) container
3. Run the image (Be sure to fill out the environment variables first):
```bash
docker run -d -p 5000:5000/tcp --env DATABASE_URL= --env REDIS_URL= --env REDIS_PREFIX=session --env AUTH_SECRET= --env AUTH_AUDIENCE=graphctf/graphctf --name graphctf graphctf/graphctf:latest
```

## Development
1. Configure [Docker Compose variables](#docker-compose-config)
2. Run the stack:
```bash
docker-compose up -d
```

## Config
All configuration is done through environment variables.

### GraphCTF config
*Note: the below options only apply to GraphCTF itself, see the next section if you're using [`docker-compose.yml`](./docker-compose.yml).*

Name | Default | Description
--- | --- | ---
`PORT` | `5000` | HTTP server port
`DATABASE_URL` | N/A | MySQL connection string
`REDIS_URL` | N/A | Redis connection string
`REDIS_PREFIX` | N/A | Redis global prefix
`EXCHANGE_SECRET` | N/A | Exchange token secret (Should **match** frontend)
`EXCHANGE_AUDIENCE` | N/A | Exchange token audience (Should **match** frontend)
`SESSION_SECRET` | N/A | Session token secret (Should be **different** than frontend)
`SESSION_AUDIENCE` | N/A | Session token audience (Should be **different** than frontend)

### Docker Compose config
*Note: the below options only apply to [`docker-compose.yml`](./docker-compose.yml), see the previous section if you're not using Docker compose.*
Name | Description
--- | ---
`MYSQL_PASSWORD` | MySQL root password
`EXCHANGE_SECRET` | Exchange token secret (Should **match** frontend)
`EXCHANGE_AUDIENCE` | Exchange token audience (Should **match** frontend)
`SESSION_SECRET` | Session token secret (Should be **different** than frontend)
`SESSION_AUDIENCE` | Session token audience (Should be **different** than frontend)