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

## Config
All configuration is done through environment variables.

### GraphCTF config
*Note: the below options only apply to GraphCTF itself, see the next section if you're using [`docker-compose.yml`](./docker-compose.yml).*

Name | Default | Description
--- | --- | ---
`PORT` | `5000` | HTTP server port
`DATABASE_URL` | N/A | MySQL connection string
`REDIS_URL` | N/A | Redis connection string
`REDIS_PREFIX` | `session` | Redis global prefix
`AUTH_SECRET` | N/A | JWT secret (Should match frontend)
`AUTH_AUDIENCE` | `graphctf/graphctf` | JWT audience (Should match frontend)

### Docker Compose config
*Note: the below options only apply to [`docker-compose.yml`](./docker-compose.yml).*
Name | Description
--- | ---
`MYSQL_PASSWORD` | MySQL root password
`AUTH_SECRET` | JWT secret (Should match frontend)