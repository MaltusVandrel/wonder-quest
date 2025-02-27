export class CalcUtil {
  private constructor() {}
  FUN_NUMBERS = {
    NEGLIGEABLE:0.0078125,
    ABHORRENT:0.015625,
    TOO_LOW:0.03125,
    VERY_SLIM:0.0625,
    SLIM:0.125,
    VERY_UNLIKELY:0.25,
    UNLIKELY:0.5,
    FAIR:0.75,
    LIKELY:0.875,
    VERY_LIKELY:0.9375,
    ALMOST_CERTAIN:0.96875,
    CERTAIN:0.984375,
    ABSOLUTELY_CERTAIN:0.9921875
  };
  static getAValueBetween(min: number, max: number) {
    return Math.max(min, CalcUtil.getRandom(max));
  }
  static getRandom(value: number) {
    return Math.ceil(Math.random() * value);
  }
  static coinFlip(): number {
    return Math.round(Math.random());
  }
}
