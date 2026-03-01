import { render } from "@testing-library/react";
import React from "react";
import { visit } from "unist-util-visit";

jest.mock("unist-util-visit", () => ({ visit: jest.fn() }));

import {
  calculateReadingTime,
  extractText,
  formatHeading,
  parseChapterHeading,
  rehypeRemoveFootnoteBackrefs,
} from "@/utils/helpers/books/titleUtil";

const mockedVisit = visit as jest.Mock;

describe("extractText", () => {
  test("returns empty string for null", () => {
    expect(extractText(null)).toEqual("");
  });

  test("returns empty string for undefined", () => {
    expect(extractText(undefined)).toEqual("");
  });

  test("returns the string as-is", () => {
    expect(extractText("hello")).toEqual("hello");
  });

  test("converts a number to string", () => {
    expect(extractText(42)).toEqual("42");
  });

  test("joins an array of strings", () => {
    expect(extractText(["hello", " ", "world"])).toEqual("hello world");
  });

  test("extracts text from a React element", () => {
    const element = React.createElement("span", null, "chapter title");
    expect(extractText(element)).toEqual("chapter title");
  });

  test("extracts text from nested React elements", () => {
    const element = React.createElement(
      "div",
      null,
      React.createElement("span", null, "nested"),
    );
    expect(extractText(element)).toEqual("nested");
  });

  test("returns empty string for non-handled types like boolean", () => {
    expect(extractText(true as any)).toEqual("");
  });
});

describe("parseChapterHeading", () => {
  test.each([
    {
      title: "Chapitre 1 : Introduction",
      locale: "fr",
      expected: { number: 1, text: "Introduction" },
    },
    {
      title: "Chapitre 12 — Le dernier combat",
      locale: "fr",
      expected: { number: 12, text: "Le dernier combat" },
    },
    {
      title: "Chapter 3: The Battle",
      locale: "en",
      expected: { number: 3, text: "The Battle" },
    },
    {
      title: "Chapter 5",
      locale: "en",
      expected: { number: 5, text: "" },
    },
  ])("parses '$title' correctly", ({ title, locale, expected }) => {
    expect(parseChapterHeading(title, locale)).toEqual(expected);
  });

  test.each([
    { title: "Prologue", locale: "fr" },
    { title: "Sources", locale: "en" },
    { title: "Epilogue", locale: "fr" },
  ])("returns null for non-chapter heading '$title'", ({ title, locale }) => {
    expect(parseChapterHeading(title, locale)).toBeNull();
  });
});

describe("calculateReadingTime", () => {
  test("returns 1 for very short content", () => {
    expect(calculateReadingTime("Hello world")).toBe(1);
  });

  test("calculates minutes based on 200 wpm", () => {
    const words = Array(400).fill("word").join(" ");
    expect(calculateReadingTime(words)).toBe(2);
  });

  test("strips HTML comments before counting", () => {
    const content = "<!-- Copyright notice --> Hello world";
    expect(calculateReadingTime(content)).toBe(1);
  });

  test("strips HTML tags before counting", () => {
    const content = '<a className="button-chapter-book" href="/next">Next</a>';
    expect(calculateReadingTime(content)).toBe(1);
  });

  test("strips footnote references before counting", () => {
    const content = "Some text[^1]\n\n[^1]: A footnote reference.";
    expect(calculateReadingTime(content)).toBe(1);
  });

  test("strips markdown link syntax but keeps link text", () => {
    const content = "[anchor text](https://example.com)";
    expect(calculateReadingTime(content)).toBe(1);
  });
});

describe("rehypeRemoveFootnoteBackrefs", () => {
  const applyTransformer = (nodeChildren: any[]) => {
    const node = { children: nodeChildren };
    mockedVisit.mockImplementation((_tree: any, _type: any, visitor: any) => {
      visitor(node);
    });
    rehypeRemoveFootnoteBackrefs()({});
    return node;
  };

  afterEach(() => {
    mockedVisit.mockReset();
  });

  test("does nothing if node has no children", () => {
    const node: any = {};
    mockedVisit.mockImplementation((_tree: any, _type: any, visitor: any) => {
      visitor(node);
    });
    rehypeRemoveFootnoteBackrefs()({});
    expect(node.children).toBeUndefined();
  });

  test("keeps non-element children", () => {
    const textNode = { type: "text", value: "hello" };
    const node = applyTransformer([textNode]);
    expect(node.children).toEqual([textNode]);
  });

  test("keeps element children that are not anchors", () => {
    const span = {
      type: "element",
      tagName: "span",
      properties: {},
      children: [],
    };
    const node = applyTransformer([span]);
    expect(node.children).toEqual([span]);
  });

  test("keeps regular anchor without backref properties", () => {
    const anchor = {
      type: "element",
      tagName: "a",
      properties: { href: "/next" },
      children: [],
    };
    const node = applyTransformer([anchor]);
    expect(node.children).toEqual([anchor]);
  });

  test("removes anchor with data-footnote-backref property", () => {
    const backref = {
      type: "element",
      tagName: "a",
      properties: { "data-footnote-backref": true },
      children: [],
    };
    const keep = { type: "text", value: "text" };
    const node = applyTransformer([keep, backref]);
    expect(node.children).toEqual([keep]);
  });

  test("removes anchor with dataFootnoteBackref property", () => {
    const backref = {
      type: "element",
      tagName: "a",
      properties: { dataFootnoteBackref: true },
      children: [],
    };
    const node = applyTransformer([backref]);
    expect(node.children).toEqual([]);
  });

  test("removes anchor with rel string containing footnote-backref", () => {
    const backref = {
      type: "element",
      tagName: "a",
      properties: { rel: "footnote-backref" },
      children: [],
    };
    const node = applyTransformer([backref]);
    expect(node.children).toEqual([]);
  });

  test("removes anchor with rel array containing footnote-backref", () => {
    const backref = {
      type: "element",
      tagName: "a",
      properties: { rel: ["footnote-backref", "nofollow"] },
      children: [],
    };
    const node = applyTransformer([backref]);
    expect(node.children).toEqual([]);
  });
});

describe("formatHeading", () => {
  test("renders 'Notes' when children is 'Footnotes'", () => {
    const { getByRole } = render(<>{formatHeading("Footnotes")}</>);
    expect(getByRole("heading", { name: "Notes" })).toBeInTheDocument();
  });

  test("renders the heading text as-is for other values", () => {
    const { getByRole } = render(<>{formatHeading("Bibliography")}</>);
    expect(getByRole("heading", { name: "Bibliography" })).toBeInTheDocument();
  });
});
