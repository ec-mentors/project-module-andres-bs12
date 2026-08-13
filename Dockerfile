# ==========================================
# STAGE 1: Build Frontend (React / Vite)
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy dependency manifests and install packages
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source code and compile static bundle
COPY frontend/ ./
RUN npm run build

# ==========================================
# STAGE 2: Build Backend (Spring Boot + Static Frontend)
# ==========================================
FROM maven:3.9-eclipse-temurin-17 AS backend-builder
WORKDIR /app

# Copy pom.xml and Spring Boot source code
COPY pom.xml ./
COPY src ./src

# Copy compiled frontend dist into Spring Boot static resources
COPY --from=frontend-builder /app/src/main/resources/static ./src/main/resources/static

# Package executable JAR file skipping tests
RUN mvn clean package -DskipTests

# ==========================================
# STAGE 3: Minimal Runtime Image
# ==========================================
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy compiled JAR artifact from builder stage
COPY --from=backend-builder /app/target/NutritionTracker-0.0.1-SNAPSHOT.jar app.jar

# Expose default application port
EXPOSE 8080

# Launch application
ENTRYPOINT ["java", "-jar", "app.jar"]