/**
 * 작업 스케줄링 관련 코드
 *
 * requestIdleCallback 대신, 자체구현.
 * 웹 API에 대한 의존성을 줄이고, 크로스 브라우저 호환성을 개선할 수 있음
 */

export const scheduler = {
  requestIdleCallback:
    window.requestIdleCallback ||
    function (callback) {
      const start = Date.now();
      return setTimeout(() => {
        callback({
          didTimeout: false,
          timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
        });
      }, 1);
    },
};
