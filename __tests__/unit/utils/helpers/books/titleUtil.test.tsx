import { render } from "@testing-library/react";
import React from "react";

jest.mock("unist-util-visit", () => ({ visit: jest.fn() }));

import {
  extractText,
  formatHeading,
  parseChapterHeading,
} from "@/utils/helpers/books/titleUtil";

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
