import { sanitize, makeKey } from "./string.utils";

// sanitize Function Tests

describe("sanitize Function (Comportamento Original)", () => {
  it("should convert string to lowercase", () => {
    expect(sanitize("HelloWorld")).toBe("helloworld");
  });

  it("should replace spaces with hyphens", () => {
    expect(sanitize("hello world test")).toBe("hello-world-test");
  });

  it("should remove accents and diacritics", () => {
    expect(sanitize("coração ágil é Assim")).toBe("coracao-agil-e-assim");
  });

  it("should NOT remove most special characters, only accents and spaces", () => {
    expect(sanitize("Test@123!#File_Name.png")).toBe("test@123!#file_name.png");
  });

  it("should handle multiple spaces correctly (converts to single hyphen)", () => {
    expect(sanitize("hello   world--test")).toBe("hello-world--test");
  });

  it("should handle multiple spaces correctly by replacing them with a single hyphen", () => {
    expect(sanitize("hello   world")).toBe("hello-world");
  });

  it("should handle leading/trailing spaces by converting them to hyphens", () => {
    expect(sanitize("  hello ")).toBe("-hello-");
  });

  it("should return an empty string for null or undefined input", () => {
    expect(sanitize(null)).toBe("");
    expect(sanitize(undefined)).toBe("");
  });

  it("should return an empty string for empty input string", () => {
    expect(sanitize("")).toBe("");
  });

  it("should keep most special characters if they are not spaces or accented", () => {
    expect(sanitize("!@#$%^&*()_+")).toBe("!@#$%^&*()_+");
    expect(sanitize("___")).toBe("___");
    expect(sanitize("...")).toBe("...");
    expect(sanitize("_._")).toBe("_._");
  });
});

//makeKey Function Tests

describe("makeKey Function", () => {
  it("should generate a key correctly with all valid inputs", () => {
    const data = {
      productType: "Boné Americano",
      cutType: "Frente Copa",
      material: "Linho Premium",
      materialColor: "Azul Marinho",
    };
    expect(makeKey(data)).toBe(
      "bone-americano_frente-copa_linho-premium_azul-marinho"
    );
  });

  it("should handle inputs with special characters correctly (relying on sanitize)", () => {
    const data = {
      productType: "Trucker's Cap!",
      cutType: "Aba Curva@",
      material: "Algodão & Cia.",
      materialColor: "Preto/Branco",
    };

    expect(makeKey(data)).toBe(
      "trucker's-cap!_aba-curva@_algodao-&-cia._preto/branco"
    );
  });

  it("should filter out empty or undefined parts and handle spaces correctly", () => {
    const data = {
      productType: "Boné",
      cutType: null,
      material: "   ",
      materialColor: "Preto",
    };

    expect(makeKey(data)).toBe("bone_-_preto");
  });

  it("should handle cases where some parts become hyphens or keep special chars", () => {
    const data = {
      productType: null,
      cutType: undefined,
      material: "  ",
      materialColor: "!@#",
    };

    expect(makeKey(data)).toBe("-_!@#");
  });

  it("should handle one valid part correctly", () => {
    const data = {
      productType: "Modelo Único",
      cutType: null,
      material: null,
      materialColor: null,
    };
    expect(makeKey(data)).toBe("modelo-unico");
  });
});
