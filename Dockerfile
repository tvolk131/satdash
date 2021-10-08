FROM node:16.10.0 AS client-base
COPY ./ ./app
WORKDIR /app
RUN cd client && npm ci && npm run build-prod

FROM rust:1.55.0 as server-base
COPY --from=client-base ./app ./app
WORKDIR /app
RUN cd server && rustup default nightly && cargo build --release && mkdir -p /build-out && cp target/release/satdash-server /build-out/

# TODO - Revert base image back to debian:10-slim.
FROM ubuntu:21.10
COPY --from=server-base /build-out/satdash-server /
ENV ROCKET_PORT=80
env ROCKET_ADDRESS="0.0.0.0"
EXPOSE 80
CMD /satdash-server