import { render } from "@testing-library/react";

import { HowToCite } from "@/components/HowToCite/HowToCite";

describe("HowToCite", () => {
  test("italicizes the site title for regular page citations", () => {
    const { container } = render(
      <HowToCite title="Beneath Artois Fields" locale="en" />,
    );

    const emphasized = Array.from(container.querySelectorAll("em")).map(
      (element) => element.textContent,
    );

    expect(emphasized).toContain("New Zealand Tunnellers Website");
  });

  test("italicizes the book title instead of the site title for book citations", () => {
    const { container } = render(
      <HowToCite
        chapterTitle="Prologue"
        pathname="/book/chapter-0-prologue"
        locale="en"
      />,
    );

    const emphasized = Array.from(container.querySelectorAll("em")).map(
      (element) => element.textContent,
    );

    expect(emphasized).toContain("Kiwis Dig Tunnels Too");
    expect(emphasized).not.toContain("New Zealand Tunnellers Website");
    expect(container.querySelector("p")).toHaveTextContent(
      "New Zealand Tunnellers Website",
    );
  });
});
