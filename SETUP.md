# 🧠 BattleMind — Guide de configuration et lancement

> Guide complet pour les membres de l'équipe : cloner le projet, installer les dépendances et le lancer sans problème.

---

## 📋 Prérequis — Ce qu'il faut installer avant tout

### 1. Node.js (via NVM — obligatoire)

Nous utilisons **NVM (Node Version Manager)** pour gérer les versions de Node.js.
Il est impératif d'utiliser la version **20.x** car certains modules natifs (notamment `better-sqlite3`) ne sont pas compatibles avec Node.js 22.

**Installer NVM pour Windows :**
→ Télécharger et installer depuis : https://github.com/coreybutler/nvm-windows/releases

Ensuite, dans un terminal, installer et activer Node.js 20 :
```powershell
nvm install 20.20.2
nvm use 20.20.2
```

Vérifier que la bonne version est active :
```powershell
node -v   # doit afficher v20.x.x
npm -v    # doit afficher 10.x.x
```

> ⚠️ **IMPORTANT** : À chaque nouvelle session de terminal, relancez `nvm use 20.20.2` si Node 22 redevient la version par défaut.

---

### 2. Java Development Kit (JDK 17)

React Native Android nécessite **JDK 17**.

- Télécharger depuis : https://www.oracle.com/java/technologies/downloads/#java17
- Ou via **Chocolatey** : `choco install temurin17`

Vérifier l'installation :
```powershell
java -version   # doit afficher openjdk 17.x.x
```

---

### 3. Android Studio & Android SDK

Télécharger **Android Studio** : https://developer.android.com/studio

Dans Android Studio → `SDK Manager`, installer :
- **Android SDK Platform 35** (Android 15)
- **Android SDK Build-Tools 35**
- **NDK (Side by side) version 27.1.12297006**
- **CMake 3.22.1**

Configurer les variables d'environnement (dans vos variables système Windows) :
```
ANDROID_HOME = C:\Users\<VOTRE_NOM>\AppData\Local\Android\Sdk
```

Ajouter au `PATH` :
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
```

---

### 4. Git

- Télécharger depuis : https://git-scm.com/download/win

---

## 🚀 Installation du projet

### Étape 1 — Cloner le dépôt

```powershell
git clone <URL_DU_DEPOT_GIT>
cd BattleMind
```

---

### Étape 2 — Vérifier la version de Node

```powershell
nvm use 20.20.2
node -v   # confirmer v20.x.x
```

---

### Étape 3 — Installer les dépendances de l'application mobile (racine)

```powershell
npm.cmd install
```

---

### Étape 4 — Installer les dépendances du serveur

```powershell
cd server
npm.cmd install
npm.cmd rebuild better-sqlite3
cd ..
```

> ⚠️ La commande `npm rebuild better-sqlite3` est **obligatoire** sous Windows. Elle compile les binaires natifs SQLite pour votre version de Node.js. Si elle échoue, vérifiez que vous utilisez bien Node.js 20.

---

### Étape 5 — Installer les dépendances iOS (Mac uniquement, ignorer sous Windows)

```bash
cd ios && bundle install && pod install && cd ..
```

---

## 📱 Préparer votre téléphone Android

1. Sur votre téléphone Android : `Paramètres → À propos du téléphone → Numéro de build` (taper 7 fois pour activer les options développeur).
2. `Paramètres → Options pour les développeurs` → Activer **Débogage USB**.
3. Brancher votre téléphone au PC avec un câble USB.
4. Accepter l'autorisation de débogage USB sur votre téléphone si une fenêtre apparaît.

Vérifier que votre téléphone est détecté :
```powershell
adb devices   # votre appareil doit apparaître dans la liste
```

---

## ▶️ Lancement du projet (3 terminaux)

> Ouvrir **3 terminaux séparés** dans le dossier racine `BattleMind/`.

---

### Terminal 1 — Serveur Metro (JavaScript)

```powershell
nvm use 20.20.2
npx.cmd react-native start
```

Attendre que le message suivant apparaisse :
```
Metro waiting on http://localhost:8081
```

---

### Terminal 2 — Redirection des ports USB (ADB)

> À exécuter **une seule fois** après avoir branché votre téléphone.

```powershell
adb reverse tcp:8081 tcp:8081
adb reverse tcp:3000 tcp:3000
```

La commande doit retourner `3000` sans erreur. Ce terminal peut ensuite être fermé.

---

### Terminal 3 — Serveur de jeu BattleMind (Backend Node.js)

```powershell
cd server
nvm use 20.20.2
npm.cmd run dev
```

Attendre que le message suivant apparaisse :
```
INFO: ✅ BattleMind Server running successfully {"host":"0.0.0.0","port":3000}
```

---

## 📲 Installer l'application sur le téléphone

> À faire **une seule fois** (ou après mise à jour du code natif).

Dans un quatrième terminal, à la racine du projet :

```powershell
nvm use 20.20.2
npx.cmd react-native run-android
```

> ⚠️ **La première compilation prend entre 30 minutes et 4 heures** selon la puissance de votre machine (compilation de nombreux modules C++ natifs). Les compilations suivantes seront beaucoup plus rapides (environ 1-2 minutes).

---

## 🔗 Connexion de l'application au serveur

Une fois les 3 terminaux lancés et l'application ouverte sur le téléphone :

- **Adresse IP à entrer dans l'application** : `127.0.0.1`
- **Port** : `3000` (configuré par défaut)

Grâce à la redirection `adb reverse`, le téléphone contactera automatiquement votre PC comme si le serveur tournait en local sur l'appareil.

---

## 🔁 Relancer le projet après un premier démarrage

Pour les lancements suivants (après la première installation), il suffit de :

1. Brancher le téléphone et lancer les 3 terminaux dans l'ordre ci-dessus.
2. **Pas besoin de relancer** `npx react-native run-android` sauf si vous avez modifié du code natif (fichiers Android, iOS, ou dépendances npm).

Pour recharger l'interface JavaScript sans reinstaller l'APK : secouer le téléphone → `Reload`.

---

## 🐛 Problèmes fréquents et solutions

| Problème | Solution |
|---|---|
| `npm : Impossible de charger le fichier .ps1` | Utiliser `npm.cmd` au lieu de `npm`, et `npx.cmd` au lieu de `npx` |
| `better-sqlite3: Could not locate bindings file` | Vérifier que vous êtes sur Node 20 : `nvm use 20.20.2` puis `npm.cmd rebuild better-sqlite3` |
| `BUILD FAILED` lors de `run-android` | Lancer `cd android && .\gradlew clean && cd ..` puis réessayer |
| Téléphone non détecté par `adb devices` | Vérifier le câble USB, réactiver le débogage USB, ou changer de port USB |
| Écran rouge / serveur inaccessible | Vérifier que les 3 terminaux sont bien lancés et relancer `adb reverse tcp:8081 tcp:8081 && adb reverse tcp:3000 tcp:3000` |
| Metro n'arrive pas à démarrer | Lancer `npx.cmd react-native start --reset-cache` |

---

## 🗂️ Structure du projet

```
BattleMind/
├── android/          # Code natif Android
├── ios/              # Code natif iOS (Mac uniquement)
├── server/           # Serveur Node.js (Express + Socket.IO + SQLite)
│   ├── src/          # Code source TypeScript du serveur
│   └── data/         # Base de données SQLite (générée automatiquement)
├── shared/           # Types TypeScript partagés (client + serveur)
├── src/              # Code source React Native (écrans, stores, socket…)
└── SETUP.md          # Ce fichier
```

---

*Dernière mise à jour : Juin 2026*
