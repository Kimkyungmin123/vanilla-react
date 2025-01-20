import { scheduleUpdate } from "../core/reconciler";
import { currentComponent, getHooks, hookIndex } from "./context";

export function useState(initail) {
  const component = currentComponent;
  const hooks = getHooks(component);
  const index = hookIndex++;

  // 이미 초기화된 상태가 있다면 그것을 사용
  if (hooks[index]) return hooks[index];

  // 상태 초기화
  const setState = (action) => {
    const hooks = getHooks(component);
    const oldValue = hooks[index][0];

    // action이 함수면 이전 상태를 인자로 실행
    const newValue = typeof action === "function" ? action(oldValue) : action;

    if (oldValue !== newValue) {
      hooks[index][0] = newValue;
      scheduleUpdate(component);
    }

    hooks[index] = [initail, setState];

    return hooks[index];
  };
}
