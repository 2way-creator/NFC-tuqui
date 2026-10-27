import JSZip from 'jszip';

export async function generateAndroidProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root configuration files
  zip.file(
    'capacitor.config.json',
    JSON.stringify(
      {
        appId: 'com.nfccardstudio.app',
        appName: 'NFC Card Studio',
        webDir: 'dist',
        bundledWebRuntime: false,
        server: {
          androidScheme: 'https',
        },
      },
      null,
      2
    )
  );

  // AndroidManifest.xml with NFC capabilities
  const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.nfccardstudio.app">

    <!-- NFC Permissions for Physical Smart Cards & NFC Tools -->
    <uses-permission android:name="android.permission.NFC" />
    <uses-feature android:name="android.hardware.nfc" android:required="true" />
    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="NFC Card Studio"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">

        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:exported="true"
            android:label="NFC Card Studio"
            android:launchMode="singleTask"
            android:theme="@style/AppTheme.NoActionBarLaunch">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Automatic NFC Tag Discovery (NDEF) for Contacts & vCards -->
            <intent-filter>
                <action android:name="android.nfc.action.NDEF_DISCOVERED" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="text/vcard" />
            </intent-filter>

            <intent-filter>
                <action android:name="android.nfc.action.TAG_DISCOVERED" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  zip.file('android/app/src/main/AndroidManifest.xml', manifestXml);

  // MainActivity.java
  const mainActivity = `package com.nfccardstudio.app;

import android.os.Bundle;
import android.nfc.NfcAdapter;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private NfcAdapter nfcAdapter;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        nfcAdapter = NfcAdapter.getDefaultAdapter(this);
    }
}`;
  zip.file('android/app/src/main/java/com/nfccardstudio/app/MainActivity.java', mainActivity);

  // build.gradle (app level)
  const buildGradle = `apply plugin: 'com.android.application'

android {
    namespace "com.nfccardstudio.app"
    compileSdkVersion 34
    defaultConfig {
        applicationId "com.nfccardstudio.app"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation project(':capacitor-android')
}`;
  zip.file('android/app/build.gradle', buildGradle);

  // README with build instructions
  const readme = `# NFC Card Studio - Proyecto Nativo Android (APK)

Este paquete contiene la estructura para compilar tu aplicación nativa Android (.APK) con soporte para lectura y escritura de tarjetas inteligentes NFC.

## Pasos para generar el archivo APK:

### Opción 1: Con Android Studio (Recomendada)
1. Instala Android Studio en tu computadora.
2. Abre la carpeta \`android/\` en Android Studio.
3. Espera a que Gradle sincronice las dependencias.
4. Ve al menú superior: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5. El archivo **app-debug.apk** estará listo para instalar en cualquier teléfono Android o compartir vía WhatsApp / Cable USB.

### Opción 2: Desde Terminal / Consola
\`\`\`bash
npm run build
npx cap copy android
cd android
./gradlew assembleDebug
\`\`\`
El APK compilado se encontrará en: \`android/app/build/outputs/apk/debug/app-debug.apk\`.

### Permisos Incluidos:
- \`android.permission.NFC\`: Acceso directo al chip NFC del smartphone.
- \`android.nfc.action.NDEF_DISCOVERED\`: Apertura automática al detectar una tarjeta con vCard.
`;
  zip.file('README_ANDROID.md', readme);

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadAndroidProject() {
  generateAndroidProjectZip().then((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'NFC_Card_Studio_Android_Project.zip');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}
