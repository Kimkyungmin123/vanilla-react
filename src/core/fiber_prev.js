// Fiber Node 정의 : 각 노드는 트리 내 위치 정보를 포함합니다.
class FiberNode {
  constructor(key, parent, child, sibling) {
    this.key = key; // 고유 식별자
    this.parent = parent; // 부모 노드
    this.child = child; // 자식 노드
    this.sibling = sibling; // 형제 노드
    this.state = {}; // 상태 정보
    this.effectTag = null; // 작업 태그  (추가 / 삭제 / 업데이트)
  }
}

// Fiber Tree 생성
function createFiberTree(data) {
  const root = new FiberNode(data.key, null, null, null);
  let currentNode = root;

  data.children.forEach((child, index) => {
    const childNode = new FiberNode(child.key, currentNode, null, null);

    if (index === 0) {
      currentNode.children = childNode; // 첫 자식 설정
    } else {
      currentNode.sibling = childNode; // 형제 노드 연결
    }
    currentNode = childNode;
  });

  return root;
}

// 작업 단위 처리 :
// * performUnitOfWork 함수에서 각 Fiber 노드를 처리
// * 자식 → 형제 → 부모 순으로 노드를 탐색

// 스케줄링
// * requestIdleCallback를 사용해 브라우저의 여유 시간에 작업을 처리
// * 실제 React는 브라우저 환경과 Node.js 환경 모두에서 동작하도록 별도의 스케줄링 구현을 사용

// 작업 스케줄러
function performUnitOfWork(fiber) {
  console.log(`processing Fiber Node: ${fiber.key}`);

  // 자식 노드 처리
  if (fiber.child) {
    return fiber.child;
  }

  // 형제 노드 처리
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent; // 부모 노드로 이동
  }

  return null; // 작업 완료
}

// 작업 실행
function workLoop(root) {
  let nextUnitOfWork = root;

  function loop(deadline) {
    while (nextUnitOfWork && deadline.timeRemaining() > 1) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }

    if (nextUnitOfWork) {
      requestIdleCallback(loop); // 남은 작업 재요청
    } else {
      console.log("All work completed !");
    }
  }

  requestIdleCallback(loop);
}

// 데이터 트리 생성
const data = {
  key: "root",
  children: [{ key: "child1" }, { key: "child2" }, { key: "child3" }],
};

// Fiber 트리 생성 및 작업 실행
const fiberTree = createFiberTree(data);
workLoop(fiberTree);

/**
 * deadline.timeRemaining()
 * requestIdleCallback의 콜백에서 받은 deadline 객체의 메서드
 * 현재 idle period에서 남은 예상 시간을 밀리초 단위로 반환
 * 반환값이 1ms 미만이면 다른 중요한 작업에 양보하는 것이 좋음 ( < 1 )
 */
