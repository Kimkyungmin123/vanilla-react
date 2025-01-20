/**
 * DOM 조작 관련 함수들
 */

export function createDom(fiber) {
  const dom =
    fiber.element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.element.type);

  updateDom(dom, {}, fiber.element.props);

  return dom;
}

export function updateDom(dom, prevProps, nextProps) {
  // Remove old properties
  Object.keys(prevProps)
    .filter((key) => key !== "children")
    .filter((key) => !(key in nextProps))
    .forEach((key) => {
      dom[key] = "";
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter((key) => key !== "children")
    .filter((key) => prevProps[key] !== nextProps[key])
    .forEach((key) => {
      dom[key] = nextProps[key];
    });
}
