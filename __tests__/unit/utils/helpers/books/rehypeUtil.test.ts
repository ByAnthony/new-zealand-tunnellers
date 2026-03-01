jest.mock("unist-util-visit", () => ({
  visit: (tree: any, type: any, callback: any) => {
    const traverse = (n: any) => {
      if (n.type === type) callback(n);
      if (Array.isArray(n.children)) n.children.forEach(traverse);
    };
    traverse(tree);
  },
}));

import { rehypeRemoveFootnoteBackrefs } from "@/utils/helpers/books/titleUtil";

describe("rehypeRemoveFootnoteBackrefs", () => {
  test("removes anchors with data-footnote-backref property", () => {
    const plugin = rehypeRemoveFootnoteBackrefs();
    const tree: any = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "p",
          properties: {},
          children: [
            {
              type: "element",
              tagName: "a",
              properties: { "data-footnote-backref": "" },
              children: [],
            },
            {
              type: "element",
              tagName: "span",
              properties: {},
              children: [],
            },
          ],
        },
      ],
    };

    plugin(tree);

    expect(tree.children[0].children).toHaveLength(1);
    expect(tree.children[0].children[0].tagName).toBe("span");
  });

  test("removes anchors with dataFootnoteBackref property", () => {
    const plugin = rehypeRemoveFootnoteBackrefs();
    const tree: any = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "p",
          properties: {},
          children: [
            {
              type: "element",
              tagName: "a",
              properties: { dataFootnoteBackref: true },
              children: [],
            },
          ],
        },
      ],
    };

    plugin(tree);

    expect(tree.children[0].children).toHaveLength(0);
  });

  test("removes anchors with rel footnote-backref as a string", () => {
    const plugin = rehypeRemoveFootnoteBackrefs();
    const tree: any = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "p",
          properties: {},
          children: [
            {
              type: "element",
              tagName: "a",
              properties: { rel: "footnote-backref" },
              children: [],
            },
          ],
        },
      ],
    };

    plugin(tree);

    expect(tree.children[0].children).toHaveLength(0);
  });

  test("removes anchors with rel footnote-backref as an array", () => {
    const plugin = rehypeRemoveFootnoteBackrefs();
    const tree: any = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "p",
          properties: {},
          children: [
            {
              type: "element",
              tagName: "a",
              properties: { rel: ["noopener", "footnote-backref"] },
              children: [],
            },
          ],
        },
      ],
    };

    plugin(tree);

    expect(tree.children[0].children).toHaveLength(0);
  });

  test("keeps non-backref anchor elements", () => {
    const plugin = rehypeRemoveFootnoteBackrefs();
    const tree: any = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "p",
          properties: {},
          children: [
            {
              type: "element",
              tagName: "a",
              properties: { href: "#footnote-1" },
              children: [],
            },
          ],
        },
      ],
    };

    plugin(tree);

    expect(tree.children[0].children).toHaveLength(1);
  });

  test("keeps non-anchor elements", () => {
    const plugin = rehypeRemoveFootnoteBackrefs();
    const tree: any = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "p",
          properties: {},
          children: [
            {
              type: "element",
              tagName: "span",
              properties: {},
              children: [],
            },
          ],
        },
      ],
    };

    plugin(tree);

    expect(tree.children[0].children).toHaveLength(1);
  });

  test("keeps non-element child nodes", () => {
    const plugin = rehypeRemoveFootnoteBackrefs();
    const tree: any = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "p",
          properties: {},
          children: [{ type: "text", value: "some text" }],
        },
      ],
    };

    plugin(tree);

    expect(tree.children[0].children).toHaveLength(1);
  });

  test("handles nodes without children gracefully", () => {
    const plugin = rehypeRemoveFootnoteBackrefs();
    const tree: any = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "br",
          properties: {},
          children: null,
        },
      ],
    };

    expect(() => plugin(tree)).not.toThrow();
  });
});
