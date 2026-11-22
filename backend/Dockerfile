# Multi-stage Dockerfile for Spring Boot 3 Music LMS Backend
# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Cache Maven dependencies and plugins with controlled bounded retries and exponential backoff
# Mitigates transient Maven Central HTTP 429 (Too Many Requests) and network drops on shared cloud build IPs
COPY pom.xml .
RUN set -e; \
    max_attempts=5; \
    delay=5; \
    for attempt in 1 2 3 4 5; do \
      echo "=== [Step 1/2] Resolving Maven dependencies (Attempt $attempt of $max_attempts) ==="; \
      if mvn dependency:resolve dependency:resolve-plugins -B \
          -Dmaven.wagon.http.pool=false \
          -Dhttp.keepAlive=false \
          -Dmaven.wagon.httpconnectionManager.maxPerRoute=2; then \
        echo "=== [Step 1/2] Dependencies and plugins successfully resolved ==="; \
        break; \
      fi; \
      if [ "$attempt" -eq "$max_attempts" ]; then \
        echo "ERROR: Failed to resolve Maven dependencies after $max_attempts attempts." >&2; \
        exit 1; \
      fi; \
      echo "WARNING: Maven resolution failed (HTTP 429 or network issue). Retrying in ${delay}s..." >&2; \
      sleep "$delay"; \
      delay=$((delay * 2)); \
    done

# Copy application source code
COPY src ./src

# Build production Spring Boot executable JAR with controlled retries
RUN set -e; \
    max_attempts=3; \
    delay=5; \
    for attempt in 1 2 3; do \
      echo "=== [Step 2/2] Packaging application JAR (Attempt $attempt of $max_attempts) ==="; \
      if mvn clean package -DskipTests -B \
          -Dmaven.wagon.http.pool=false \
          -Dhttp.keepAlive=false \
          -Dmaven.wagon.httpconnectionManager.maxPerRoute=2; then \
        echo "=== [Step 2/2] Application JAR successfully created ==="; \
        break; \
      fi; \
      if [ "$attempt" -eq "$max_attempts" ]; then \
        echo "ERROR: Maven package failed after $max_attempts attempts." >&2; \
        exit 1; \
      fi; \
      echo "WARNING: Maven package failed. Retrying in ${delay}s..." >&2; \
      sleep "$delay"; \
      delay=$((delay * 2)); \
    done

# Stage 2: Minimal Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Non-root user for cloud security best practices
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy built artifact
COPY --from=builder /app/target/*.jar app.jar

# Cloud platform port binding (Render default is 10000)
ENV PORT=10000
EXPOSE 10000

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-10000} -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
