// Service Worker for Kim Secretary PWA
const CACHE_NAME = 'kim-secretary-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/2-체험용-샘플/업무대시보드.html',
  '/2-체험용-샘플/매출보고서.html',
  '/2-체험용-샘플/subtrac-분석보고서.html',
  '/2-체험용-샘플/mbis-분석보고서.html'
];

// 설치 이벤트
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('✅ Service Worker 설치됨');
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {
        console.log('⚠️ 일부 리소스 캐싱 실패 (오프라인 지원 제한)');
      });
    })
  );
  self.skipWaiting();
});

// 활성화 이벤트
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 페치 이벤트 (캐시 우선 전략)
self.addEventListener('fetch', event => {
  // GET 요청만 처리
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response; // 캐시된 응답 반환
      }

      return fetch(event.request).then(response => {
        // 유효한 응답만 캐싱
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // 응답 복사 (한 번만 사용 가능하므로)
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });

        return response;
      }).catch(() => {
        // 네트워크 오류 시 캐시된 페이지 반환
        return caches.match('/index.html');
      });
    })
  );
});
