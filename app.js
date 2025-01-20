import vanillaReact from ".";

const element = vanillaReact.createElement(
  "div",
  { id: "container" },
  vanillaReact.createElement("h1", null, "hello"),
  vanillaReact.createElement("p", null, "this is a simple implementation")
);

vanillaReact.render(element, document.getElementById("root"));
