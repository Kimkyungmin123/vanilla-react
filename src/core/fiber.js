export class Fiber {
  constructor(element, parent = null) {
    this.element = element;
    this.parent = parent;
    this.child = null;
    this.sibling = null;
    this.alternate = null; // 이전 트리와 비교 가능
    this.dom = null;
    this.effetTag = "PLACEMENT";
  }
}
