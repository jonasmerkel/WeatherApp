# 🌤️ Weather App

Eine moderne, barrierefreie Wetter-App mit deutscher Lokalisierung, die aktuelle Wetterbedingungen für jede Stadt weltweit anzeigt.

![Weather App Screenshot](https://img.shields.io/badge/Status-Active-green) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

## ✨ Features

- **📝 TypeScript**: Vollständig in TypeScript entwickelt für Typsicherheit und bessere Developer Experience
- **🌍 Weltweite Stadtsuche**: Suchen Sie nach jeder Stadt weltweit
- **🎯 Intelligente Autovervollständigung**: Schnelle Stadtsuche mit Vorschlägen
- **💾 Lokaler Speicher**: Ihre letzte Stadt wird automatisch gespeichert
- **♿ Barrierefreiheit**: Vollständige WCAG-Compliance mit Screenreader-Unterstützung
- **📱 Responsive Design**: Optimiert für Desktop, Tablet und Smartphone
- **🎨 Dynamische Themes**: Hintergrund passt sich den Wetterbedingungen an
- **⚡ PWA-Ready**: Progressive Web App Funktionalität
- **🔄 Echtzeit-Updates**: Aktuelle Wetterdaten über moderne APIs
- **🐳 Docker-Support**: Einfache Bereitstellung mit Docker und Docker Compose

## 📸 Screenshots

Die App zeigt folgende Wetterinformationen:

- Aktuelle Temperatur und gefühlte Temperatur
- Wetterbedingungen mit passenden Icons
- Luftfeuchtigkeit und Windgeschwindigkeit
- Postleitzahlen der gesuchten Stadt
- Animierte Übergänge zwischen verschiedenen Wetterlagen

## 🚀 Installation & Setup

### Voraussetzungen

- Node.js >= 16.0.0
- npm >= 8.0.0
- Moderne Webbrowser mit ES6+ Support

### Lokale Entwicklung

1. **Repository klonen**

   ```bash
   git clone git@github.com:G4PLS/WVS-WeatherApp.git
   cd WVS-WeatherApp
   ```

2. **Abhängigkeiten installieren**

   ```bash
   npm install
   ```

3. **TypeScript kompilieren**

   ```bash
   npm run build
   ```

4. **Entwicklungsserver starten**

   ```bash
   npm run dev
   ```

5. **App öffnen**: Navigieren Sie zu `http://localhost:8003`

### Produktions-Build

```bash
# Produktions-Build erstellen
npm run build:prod

# Oder mit Clean-Build
npm run clean && npm run build:prod
```

## 🐳 Docker Deployment

### Mit Docker

```bash
# Docker Image erstellen
npm run docker:build

# Container starten
npm run docker:run
```

### Mit Docker Compose

```bash
# Alle Services starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f

# Services stoppen
docker-compose down
```

Die App ist dann unter `http://localhost:8080` verfügbar.

## 📁 Projektstruktur

```
WVS-WeatherApp/
├── public/                 # Statische Assets
│   ├── index.html         # Haupt-HTML-Datei
│   ├── style.css          # Styling und Themes
│   └── assets/
│       └── images/        # Wetter-Icons
├── src/                   # TypeScript Quellcode
│   ├── index.ts          # Haupt-App-Logik
│   ├── search.ts         # Such-Funktionalität
│   ├── storage.ts        # LocalStorage Management
│   └── weather-api.ts    # Wetter-API Integration
├── dist/                  # Kompilierte JavaScript-Dateien
├── docker-compose.yml     # Docker Compose Konfiguration
├── Dockerfile            # Docker Build Konfiguration
├── nginx.conf           # Nginx Server Konfiguration
├── package.json         # NPM Abhängigkeiten und Scripts
└── tsconfig.json        # TypeScript Konfiguration
```

## 🛠️ Verfügbare Scripts

| Script                 | Beschreibung                           |
| ---------------------- | -------------------------------------- |
| `npm run build`        | TypeScript kompilieren                 |
| `npm run build:prod`   | Produktions-Build ohne Source Maps     |
| `npm run dev`          | Entwicklungsserver starten (Port 8003) |
| `npm start`            | Build + Dev-Server in einem Schritt    |
| `npm run clean`        | Dist-Ordner löschen                    |
| `npm run type-check`   | TypeScript Syntax prüfen ohne Build    |
| `npm run docker:build` | Docker Image erstellen                 |
| `npm run docker:run`   | Docker Container starten               |

## 📝 TypeScript Entwicklung

Die gesamte Anwendung ist in **TypeScript** geschrieben und nutzt moderne ES6+ Features:

### Typisierte APIs

```typescript
// Beispiel aus weather-api.ts
export interface WeatherData {
  temperature: number;
  feelsLike: number;
  weatherDescription: string;
  cityName: string;
  country: string;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  postcodes?: string[];
}

export interface Coordinates {
  lat: number;
  lon: number;
  name: string;
  country?: string;
  postcodes?: string[];
  searchText?: string;
}
```

### Strikte Typisierung

- Alle Funktionen sind vollständig typisiert
- Interfaces für API-Responses
- Typsichere Event-Handling
- Strikte Null-Checks aktiviert

### Build-Prozess

1. **Entwicklung**: TypeScript wird mit Source Maps kompiliert
2. **Produktion**: Optimierte Builds ohne Debug-Informationen
3. **Type-Checking**: Separater Type-Check ohne Code-Generierung

## 🏗️ Architektur

### Frontend

- **TypeScript**: Typsichere Entwicklung mit modernem JavaScript
- **Vanilla JS**: Keine Framework-Abhängigkeiten für maximale Performance
- **CSS3**: Moderne Styles mit Flexbox und CSS Grid
- **Progressive Enhancement**: Funktioniert auch bei deaktiviertem JavaScript

### APIs

- **Nominatim API**: Geocoding und Stadtsuche
- **Open-Meteo API**: Kostenlose Wetterdaten ohne API-Key
- **REST-basierte Kommunikation**: Einfache HTTP-Requests

### Storage

- **LocalStorage**: Persistierung der letzten gewählten Stadt
- **Fallback-Mechanismen**: Graceful Degradation bei Storage-Fehlern

## ♿ Barrierefreiheit

Die App implementiert moderne Accessibility-Standards:

- **Semantisches HTML**: Korrekte HTML-Struktur und Landmarks
- **ARIA-Labels**: Ausführliche Beschreibungen für Screenreader
- **Keyboard Navigation**: Vollständige Tastatur-Bedienbarkeit
- **Focus Management**: Sichtbare Focus-Indikatoren
- **Screen Reader Announcements**: Live-Updates für Wetteränderungen
- **High Contrast Support**: Unterstützung für Hochkontrast-Modi

### Tastaturkürzel

- `Enter`: Wetter für gewählte Stadt abrufen
- `Pfeiltasten`: Navigation in Suchvorschlägen
- `Ctrl+Shift+C`: Gespeicherte Stadt löschen

## 🎨 Design & UX

- **Responsive Design**: Mobile-First Ansatz
- **Smooth Animations**: CSS-Transitionen für bessere UX
- **Loading States**: Visuelle Rückmeldung während API-Calls
- **Error Handling**: Benutzerfreundliche Fehlermeldungen
- **Consistent Spacing**: Design System mit einheitlichen Abständen
- **Accessible Colors**: WCAG AA kontrast-konforme Farbpalette

## 🔧 Konfiguration

### Browser-Unterstützung

```json
{
  "browserslist": ["> 1%", "last 2 versions", "not dead"]
}
```

### TypeScript Konfiguration

Die App nutzt eine strenge TypeScript-Konfiguration für maximale Typsicherheit:

- **Target**: ES6
- **Module**: ESNext
- **Strict Mode**: Vollständig aktiviert
- **Source Maps**: Entwicklung aktiviert, Produktion deaktiviert
- **Strikte Optionen**:
  - `noUncheckedIndexedAccess`: true
  - `exactOptionalPropertyTypes`: true
  - `isolatedModules`: true
  - `verbatimModuleSyntax`: true
- **Output**: `./src` → `./dist` mit Declaration Files

## 🚀 Deployment

### Nginx (Empfohlen)

Die App wird mit einer optimierten Nginx-Konfiguration ausgeliefert:

- Gzip-Kompression
- Cache-Headers für statische Assets
- SPA-Routing-Unterstützung

### Andere Webserver

Die App funktioniert mit jedem modernen Webserver, der statische Dateien ausliefern kann.

## 🔍 Monitoring & Health Checks

Docker-Container enthalten integrierte Health-Checks:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## 📝 Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei für Details.

## 👥 Contributing

Beiträge sind willkommen! Bitte:

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/amazing-feature`)
3. Committe deine Änderungen (`git commit -m 'Add amazing feature'`)
4. Push zum Branch (`git push origin feature/amazing-feature`)
5. Öffne eine Pull Request

## 📞 Support

Bei Fragen oder Problemen:

- Öffne ein [GitHub Issue](https://github.com/G4PLS/WVS-WeatherApp/issues)
- Kontaktiere den Entwickler: [g4pls](https://github.com/G4PLS)

## 🏷️ Keywords

`weather` `typescript` `accessibility` `responsive` `pwa` `docker` `german` `vanilla-js` `open-source`

---
