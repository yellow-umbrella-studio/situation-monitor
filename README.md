# 👁️ Situation Monitor

> *I'm monitoring the situation*

A viral, meme-inspired mobile app that lets users "monitor" various global situations in a sleek command-center style interface. Think Bloomberg Terminal meets TikTok.

![Status](https://img.shields.io/badge/status-monitoring-00FF88?style=flat-square)
![React Native](https://img.shields.io/badge/React%20Native-Expo-000000?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

## 🎯 Overview

Situation Monitor transforms the way you stay informed about global events. Monitor world news, markets, tech, sports, entertainment, memes, weather, and science — all from one beautifully designed command center.

### Features

- 🌍 **Multi-topic monitoring** - Track 8 different categories
- 📊 **Global status dashboard** - See situation status at a glance
- 📈 **Live ticker** - Real-time market data
- 🗺️ **Live map** - Geographic visualization of active situations
- 🔔 **Smart alerts** - Breaking news notifications
- 📱 **Share-worthy UI** - Screenshot-ready design
- 🌙 **Dark mode default** - Command center aesthetic

## 🛠️ Tech Stack

- **Framework:** React Native + Expo
- **Navigation:** Expo Router
- **Animations:** React Native Reanimated
- **State:** React Context + AsyncStorage
- **Styling:** Custom design system
- **Icons:** @expo/vector-icons (Feather)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app (for testing on device)

### Installation

```bash
# Clone the repository
git clone https://github.com/yellow-umbrella-studio/situation-monitor.git

# Navigate to directory
cd situation-monitor

# Install dependencies
npm install

# Start the development server
npm start
```

### Running the app

```bash
# Start Expo
npm start

# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 📁 Project Structure

```
situation-monitor/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Dashboard
│   │   ├── map.tsx        # Live map
│   │   ├── alerts.tsx     # Alerts
│   │   └── settings.tsx   # Settings
│   ├── onboarding/        # Onboarding flow
│   ├── topic/[id].tsx     # Topic detail
│   ├── situation/[id].tsx # Situation detail
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # UI components
│   ├── constants/         # Theme & topics
│   ├── context/           # App state
│   ├── data/              # Mock data
│   └── utils/             # Helpers
└── assets/                # Images & icons
```

## 🎨 Design System

### Colors

| Name | Hex | Usage |
|------|-----|-------|
| Background | `#0A0A0F` | App background |
| Card | `#14141A` | Card surfaces |
| Primary | `#00FF88` | Accent, monitoring |
| Alert | `#FF3B3B` | Critical status |
| Warning | `#FFB800` | Elevated status |

### Status Levels

- 🟢 **Normal** - All systems nominal
- 🟡 **Elevated** - Increased activity
- 🔴 **Critical** - Requires attention

## 📱 Screenshots

*Coming soon*

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Inspired by the "I'm monitoring the situation" meme
- Design influenced by [World Monitor](https://worldmonitor.app)
- Built with love by Yellow Umbrella Studio

---

<p align="center">
  <strong>👁️ Stay vigilant. Monitor everything.</strong>
</p>
