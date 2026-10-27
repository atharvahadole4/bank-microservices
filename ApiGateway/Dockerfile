FROM eclipse-temurin:17-jre

WORKDIR /app
COPY target/swiggy-gateway-0.0.1-SNAPSHOT.jar app.jar
COPY src/main/resources/application.yml /app/application.yml

EXPOSE 8765
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
