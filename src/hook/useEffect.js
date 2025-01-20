import { currentComponent, getHooks, hookIndex } from "./context";

export function useEffect(callback, deps) {
  const component = currentComponent;
  const hooks = getHooks(component);
  const index = hookIndex++;

  const hasNoDeps = !deps;
  const hasDepsChanged = hooks[index]
    ? !deps.every((dep, i) => dep === hooks[index].deps[i])
    : true;

  if (hasNoDeps || hasDepsChanged) {
    // 이전 effect cleanup 처리
    if (hooks[index]?.cleanup) {
      hooks[index].cleanup();
    }

    const cleanup = callback() || (() => {});
    hooks[index] = { deps, cleanup };
  }
}
