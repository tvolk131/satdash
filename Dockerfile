FROM node:19.0.0 AS client-base
COPY ./ ./app
WORKDIR /app
RUN cd client && npm ci --only=production && npm run build-prod

FROM rust:1.64.0 as server-base
COPY --from=client-base ./app ./app
WORKDIR /app
RUN cd server && cargo build --release && mkdir -p /build-out && cp target/release/satdash-server /build-out/

FROM ubuntu:22.10
COPY --from=server-base /build-out/satdash-server /
ENV ROCKET_PORT=80
ENV ROCKET_ADDRESS="0.0.0.0"
EXPOSE 80
CMD /satdash-server
