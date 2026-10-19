const installButton = document.getElementById('install-app-button');
const updateButton = document.getElementById('update-app-button');
const networkStatus = document.getElementById('network-status');
const pwaHelp = document.getElementById('pwa-help');
const pwaHelpText = document.getElementById('pwa-help-text');
let deferredInstallPrompt = null;
let serviceWorkerRegistration = null;

function setNetworkStatus() {
  const online = navigator.onLine;
  document.documentElement.dataset.connection = online ? 'online' : 'offline';
  if (networkStatus) {
    networkStatus.textContent = online ? 'EN LÍNEA' : 'SIN CONEXIÓN';
    networkStatus.setAttribute('aria-label', online ? 'Con conexión a internet' : 'Sin conexión a internet');
    networkStatus.classList.toggle('is-offline', !online);
  }
}

function showInstallHelp() {
  if (!pwaHelp || !pwaHelpText) return;
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  pwaHelpText.textContent = isIOS
    ? 'En Safari: tocá Compartir y elegí “Agregar a pantalla de inicio”. Después podrás abrir Clash of Gods como una app.'
    : 'En Chrome o Edge: abrí el menú del navegador y elegí “Instalar aplicación” o “Agregar a pantalla principal”. La opción aparece cuando el sitio se sirve por HTTPS o desde localhost.';
  pwaHelp.hidden = false;
}

function showUpdateAvailable() {
  if (updateButton) updateButton.hidden = false;
}

installButton?.addEventListener('click', async () => {
  if (!deferredInstallPrompt) {
    showInstallHelp();
    return;
  }
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice.catch(() => null);
  deferredInstallPrompt = null;
  installButton.textContent = 'INSTALAR';
});

document.getElementById('pwa-help-close')?.addEventListener('click', () => {
  if (pwaHelp) pwaHelp.hidden = true;
});

updateButton?.addEventListener('click', () => {
  const waiting = serviceWorkerRegistration?.waiting;
  if (waiting) waiting.postMessage({ type: 'SKIP_WAITING' });
  else window.location.reload();
});

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (installButton) installButton.textContent = 'INSTALAR APP';
});
window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  if (installButton) installButton.textContent = 'APP INSTALADA';
  if (pwaHelp) pwaHelp.hidden = true;
});
window.addEventListener('online', setNetworkStatus);
window.addEventListener('offline', setNetworkStatus);

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', async () => {
    try {
      serviceWorkerRegistration = await navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' });
      await serviceWorkerRegistration.update().catch(() => {});
      if (serviceWorkerRegistration.waiting) showUpdateAvailable();
      serviceWorkerRegistration.addEventListener('updatefound', () => {
        const worker = serviceWorkerRegistration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdateAvailable();
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload());
    } catch (error) {
      console.warn('[Clash of Gods PWA] No se pudo registrar el service worker:', error);
    }
  }, { once: true });
}

setNetworkStatus();
