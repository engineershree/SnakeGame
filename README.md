# 🐍 Snake Game – React Native

A modern **Snake Game mobile application** built using **React Native**, featuring
gesture-based controls, an interactive tutorial, high-score persistence, and a polished UI.

---

## 🚀 Features

- 🎮 Classic Snake gameplay
- 🖐️ Swipe gestures (up, down, left, right)
- 📘 Mandatory gesture tutorial before gameplay
- 🏆 High score saved using AsyncStorage
- 🎉 Animated high-score popup
- 🧠 Increasing difficulty with speed scaling
- 🔁 Restart game functionality
- 📱 Responsive UI for multiple screen sizes
- 🎨 Custom app icon & polished UI

---

## 🛠 Tech Stack

- **React Native**
- **TypeScript**
- **React Navigation**
- **AsyncStorage**
- **Animated API**
- **PanResponder**
- **Android Gradle**

---

## 📱 Screens & Flow

1. Home Screen  
2. Gesture Tutorial Screen  
3. Game Screen  
4. Game Over & Restart  
5. High-Score Celebration Popup  

---

## 🧩 Gesture Tutorial

- User must complete **all 4 swipe directions**
- Gameplay unlocks only after tutorial completion
- Visual animated gesture indicators (no emojis)

---

## 🏆 High Score Logic

- Stored locally using AsyncStorage
- Automatically updates when a new high score is achieved
- Popup notification shown once per session

---

## ▶️ Run the App (Development)

```bash
# Start Metro
npm start

# Run on Android
npm run android
