# Multi-stage Dockerfile for Spring Boot 3 Music LMS Backend
# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Build application jar
COPY src ./src
RUN mvn clean package -DskipTests -B

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
