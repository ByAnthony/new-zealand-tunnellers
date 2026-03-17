import {
  getImage,
  getImageSource,
  getImageSourceArchives,
  getImageSourceAucklandLibraries,
  getImageSourceBook,
  getImageSourceBookAuthors,
  getImageSourceBookPage,
  getImageSourceFamily,
  getImageSourceNewspaper,
} from "@/utils/helpers/image"; // Adjust the import path as necessary

describe("getImageSourceAucklandLibraries", () => {
  test("returns the correct URL when provided with a reference", () => {
    const reference = "some-reference";
    const expectedUrl = `https://digitalnz.org/records?text=${reference}&tab=Images#`;
    const result = getImageSourceAucklandLibraries(reference);
    expect(result).toBe(expectedUrl);
  });

  test("returns null when the reference is null", () => {
    const result = getImageSourceAucklandLibraries(null);
    expect(result).toBeNull();
  });
});

describe("getImageSourceArchives", () => {
  test("returns an object with location and reference when both are provided", () => {
    const location = "Wellington";
    const reference = "Ref123";
    const expectedResult = { location: "Wellington", reference: "Ref123" };
    const result = getImageSourceArchives(location, reference);
    expect(result).toEqual(expectedResult);
  });

  test("returns null when location is null", () => {
    const location = null;
    const reference = "Ref123";
    const result = getImageSourceArchives(location, reference);
    expect(result).toBeNull();
  });

  test("returns null when reference is null", () => {
    const location = "Wellington";
    const reference = null;
    const result = getImageSourceArchives(location, reference);
    expect(result).toBeNull();
  });

  test("returns null when both location and reference are null", () => {
    const result = getImageSourceArchives(null, null);
    expect(result).toBeNull();
  });
});

describe("getImageSourceFamily", () => {
  test("returns the name when provided", () => {
    const name = "Smith";
    const result = getImageSourceFamily(name);
    expect(result).toBe("Smith");
  });

  test("returns null when the name is null", () => {
    const result = getImageSourceFamily(null);
    expect(result).toBeNull();
  });
});

describe("getImageSourceNewspaper", () => {
  test("returns an object with formatted date and name when both name and date are provided", () => {
    const name = "Daily News";
    const date = "2023-04-01";
    const expectedResult = { date: "1 April 2023", name: "Daily News" };
    const result = getImageSourceNewspaper(name, date);
    expect(result).toEqual(expectedResult);
  });

  test("returns null when name is null", () => {
    const date = "2023-04-01";
    const result = getImageSourceNewspaper(null, date);
    expect(result).toBeNull();
  });

  test("returns null when date is null", () => {
    const name = "Daily News";
    const result = getImageSourceNewspaper(name, null);
    expect(result).toBeNull();
  });

  test("returns null when both name and date are null", () => {
    const result = getImageSourceNewspaper(null, null);
    expect(result).toBeNull();
  });
});

describe("getImageSourceBookPage", () => {
  test("returns formatted page string when page is provided", () => {
    const page = "123";
    const expectedResult = "p.\u00A0123";
    const result = getImageSourceBookPage(page);
    expect(result).toBe(expectedResult);
  });

  test("returns null when page is null", () => {
    const result = getImageSourceBookPage(null);
    expect(result).toBeNull();
  });
});

describe("getImageSourceBookAuthors", () => {
  test("returns an array of author objects when provided with an array of authors", () => {
    const authors = [
      { forename: "John", surname: "Smith" },
      { forename: "Jane", surname: "Doe" },
    ];
    const expectedResult = [
      { forename: "John", surname: "Smith" },
      { forename: "Jane", surname: "Doe" },
    ];
    const result = getImageSourceBookAuthors(authors);
    expect(result).toEqual(expectedResult);
  });

  test("returns an empty array when provided with an empty array", () => {
    const result = getImageSourceBookAuthors([]);
    expect(result).toEqual([]);
  });
});

describe("getImageSourceBook", () => {
  const authors = [{ forename: "John", surname: "Doe" }];
  const title = "Example Book Title";
  const town = "Example Town";
  const publisher = "Example Publisher";
  const year = "2023";
  const page = "123";

  test("returns an object with all book details when all parameters are provided", () => {
    const expectedResult = {
      authors,
      title,
      town,
      publisher,
      year,
      page,
    };
    const result = getImageSourceBook(
      authors,
      title,
      town,
      publisher,
      year,
      page,
    );
    expect(result).toEqual(expectedResult);
  });

  test("returns null when any of title, town, publisher, or year is null", () => {
    expect(
      getImageSourceBook(authors, null, town, publisher, year, page),
    ).toBeNull();
    expect(
      getImageSourceBook(authors, title, null, publisher, year, page),
    ).toBeNull();
    expect(
      getImageSourceBook(authors, title, town, null, year, page),
    ).toBeNull();
    expect(
      getImageSourceBook(authors, title, town, publisher, null, page),
    ).toBeNull();
  });

  test("returns an object without page when page is null but other parameters are provided", () => {
    const expectedResult = {
      authors,
      title,
      town,
      publisher,
      year,
      page: null,
    };
    const result = getImageSourceBook(
      authors,
      title,
      town,
      publisher,
      year,
      null,
    );
    expect(result).toEqual(expectedResult);
  });
});

describe("Image Source Functions", () => {
  describe("getImageSource", () => {
    test("returns an object with all sources when provided", () => {
      const aucklandLibraries = "Some URL";
      const archives = { location: "Wellington", reference: "Ref123" };
      const family = "Smith Family";
      const newspaper = { name: "Daily News", date: "2023-04-01" };
      const book = {
        title: "Example Book",
        authors: [{ forename: "John", surname: "Doe" }],
        year: "2023",
        town: "Example Town",
        publisher: "Example Publisher",
        page: "123",
      };

      const result = getImageSource(
        aucklandLibraries,
        archives,
        family,
        newspaper,
        book,
      );

      expect(result).toEqual({
        aucklandLibraries,
        archives,
        family,
        newspaper,
        book,
      });
    });

    test("returns an object with nulls for all sources when none are provided", () => {
      const result = getImageSource(null, null, null, null, null);
      expect(result).toEqual({
        aucklandLibraries: null,
        archives: null,
        family: null,
        newspaper: null,
        book: null,
      });
    });
  });

  describe("getImage", () => {
    test("returns an object with url and source when url is provided", () => {
      const url = "http://example.com/image.jpg";
      const source = {
        aucklandLibraries: "Some URL",
        archives: null,
        family: null,
        newspaper: null,
        book: null,
      };

      const result = getImage(url, source);

      expect(result).toEqual({ url, source });
    });

    test("returns null when url is null", () => {
      const source = {
        aucklandLibraries: "Some URL",
        archives: null,
        family: null,
        newspaper: null,
        book: null,
      };
      const result = getImage(null, source);

      expect(result).toBeNull();
    });
  });
});
