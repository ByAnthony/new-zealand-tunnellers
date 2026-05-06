import {
  getTunnellersReturnUrl,
  saveRollView,
  saveTunnellersReturnUrl,
} from "@/utils/helpers/tunnellersReturn";

describe("tunnellersReturn", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  test("returns fallback URL when no return state is stored", () => {
    expect(getTunnellersReturnUrl("/tunnellers")).toBe("/tunnellers");
  });

  test("uses map fallback when the stored roll view is map", () => {
    saveRollView("map");

    expect(getTunnellersReturnUrl("/tunnellers")).toBe("/tunnellers?view=map");
  });

  test("keeps stored list return URL when the stored roll view is list", () => {
    saveRollView("list");
    localStorage.setItem("tunnellers:return", "/tunnellers?page=2");

    expect(getTunnellersReturnUrl("/tunnellers")).toBe("/tunnellers?page=2");
  });

  test("ignores stale list return URL when the stored roll view is map", () => {
    saveRollView("map");
    localStorage.setItem("tunnellers:return", "/tunnellers?page=2");

    expect(getTunnellersReturnUrl("/tunnellers")).toBe("/tunnellers?view=map");
  });

  test("saves full map return URL and map view together", () => {
    saveTunnellersReturnUrl("/tunnellers?view=map&zoom=8");

    expect(localStorage.getItem("tunnellers:return")).toBe(
      "/tunnellers?view=map&zoom=8",
    );
    expect(sessionStorage.getItem("roll:view")).toBe("map");
  });
});
