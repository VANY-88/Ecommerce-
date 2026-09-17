# Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY WebShop.Api.csproj ./
RUN dotnet restore WebShop.Api.csproj

COPY . .
RUN dotnet publish WebShop.Api.csproj -c Release -o /app/publish --no-restore

# Run
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

# Render (and most PaaS) inject PORT at runtime; fall back to 8080 for local `docker run`.
ENTRYPOINT ["/bin/sh", "-c", "ASPNETCORE_URLS=http://+:${PORT:-8080} exec dotnet WebShop.Api.dll"]
