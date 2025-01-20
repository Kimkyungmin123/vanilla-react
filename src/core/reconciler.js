/**
 * Fiber 트리 조정 및 작업 단위 처리
 */

import { currentComponent } from "../hook/context";
import { createDom, updateDom } from "./dom";
import { Fiber } from "./fiber";
import { scheduler } from "./scheduler";

// 작업 단위 관리를 위한 전역 변수
let nextUnitOfWork = null;
let currentRoot = null;
let wipRoot = null;
let deletions = []; // 제거될 노드 추적

function performUnitOfWork(fiber) {
  // DOM 노드 생성
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // 자식 요소들에 대한 Fiber 노드 생성
  const elements = fiber.element.props.children;
  let prevSibling = null;

  elements.forEach((element, index) => {
    const newFiber = new Fiber(element, fiber);

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
  });

  // 다음 작업 단위 반환
  if (fiber.child) return fiber.child;

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
}

// 변경사항 커밋
function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) return;
  const parentDom = fiber.parent.dom;

  if (fiber.effetTag === "PLACEMENT" && fiber.dom) {
    parentDom.appendChild(fiber.dom);
  } else if (fiber.effetTag === "DELETION") {
    parentDom.removeChild(fiber.dom);
  } else if (fiber.effetTag === "UPDATE" && fiber.dom) {
    updateDom(fiber.dom, fiber.alternate.element.props, fiber.element.props);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function workLoop(deadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  scheduler.requestIdleCallback(workLoop);
}

// 렌더링 시작
export function render(element, container) {
  wipRoot = new Fiber({ type: "div", props: { children: [element] } });
  wipRoot.dom = container;
  wipRoot.alternate = currentRoot;
  nextUnitOfWork = wipRoot;
  deletions = [];

  scheduler.requestIdleCallback(workLoop);
}

/**
 * requestIdleCallback(workLoop);
 * 브라우저의 Idle period(유후 시간) 동안 호출될 콜백을 큐에 등록하는 메서드
 * 콜백함수에 IdleDeadline 객체 전달
 * 브라우저가 여유 있을 때만 실행되므로, 메인 스레드 차단을 방지
 * 지원하지 않는 브라우저가 있어서 React 는 이를 직접 사용하지 않고, scheduler 패키지를 통해 자체 구현하여 사용
 *  ->  scheduler.requestIdleCallback(workLoop);
 */

export function updateFunctionComponent(fiber, hookIndex) {
  // 현재 컴포넌트 설정 및 hook 인덱스 초기화
  currentComponent = fiber;
  hookIndex = 0;

  const children = [fiber.type(fiber.props)];

  reconcileChildren(fiber, children);
}

export function scheduleUpdate(fiber) {
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot,
  };

  nextUnitOfWork = wipRoot;
  deletions = [];
}

export function reconcileChildren(fiber, chilren) {
  let oldFiber = fiber.alternate && fiber.alternate.child;
  let prevSibling = null;
  let index = 0;

  while (index < chilren.length || oldFiber) {
    const child = chilren[index];
    let newFiber = null;

    const sameType = oldFiber && child && child.type === older.type;

    // 업데이트
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: child.props,
        dom: oldFiber.dom,
        parent: fiber,
        alternate: oldFiber,
        effetTag: "UPDATE",
      };
    }

    // 새로운 요소 추가
    if (child && !sameType) {
      newFiber = {
        type: child.type,
        props: child.props,
        dom: null,
        parent: fiber,
        alternate: null,
        effetTag: "PLAINTEXT",
      };
    }
    // 요소 삭제
    if (oldFiber && !sameType) {
      oldFiber.effetTag = "DELETION";
      deletions.push(oldFiber);
    }

    // 다음 OldFiber로 이동
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    // 첫 번째 자식이면 fiber.child로 설정
    if (index === 0) {
      fiber.child = newFiber;
    } else if (child) {
      // 아니면 이전 형제의 sibling으로 연결
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}
