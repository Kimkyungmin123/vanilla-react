let currentComponent = null;
let hookIndex = 0;

const componentHooks = new WeakMap();

/**
 * 각 컴포넌트 별 독립적인 Hook 상태 관리
 * 컴포넌트가 처음 Hooks를 사용할 때 상태 초기화
 * 이미 초기화된 컴포넌트의 경우 기존 hooks 상태 반환
 */
function getHooks(component) {
  if (!componentHooks.has(component)) {
    componentHooks.set(component, []);
  }

  return componentHooks.get(component);
}

function resetHookContext() {
  hookIndex = 0;
  currentComponent = null;
}

export { currentComponent, hookIndex, getHooks, resetHookContext };

/**
 * WeakMap
 * 키 반드시 객체여야함.
 * 키로 사용된 객체에 대한 다른 참조가 없어지면 가비지 컬렉션 대상이 됨
 * 메모리 누수를 방지하기 위해 컴포넌트의 Hooks 상태를 저장하는데 적합
 */
