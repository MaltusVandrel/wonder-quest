export interface XPGrowthPlan {
  baseGoal: number;
  aimedBaseMatches: number;
  percentualBaseGoalIncrement: number;
  goalVisualMultiplierAdjustment: number;
  levelDifferenceInfluence: number;
  firstSoftLevelCap: number;
  recurringGoalPostSoftLevelCap: number;
}
export const defaultXPGrowthPlan: XPGrowthPlan = {
  baseGoal: 100,
  aimedBaseMatches: 6,
  percentualBaseGoalIncrement: 0.125,
  levelDifferenceInfluence: 2.5,
  goalVisualMultiplierAdjustment: 5,
  firstSoftLevelCap: 50,
  recurringGoalPostSoftLevelCap: 25,
};
export enum ChallangeDificultyXPInfluence {
  COUGHING_BABY = 0.0000001,
  VERY_EASY = 0.5,
  EASY = 0.75,
  NORMAL = 1,
  HARD = 1.25,
  VERY_HARD = 1.5,
  INSANE = 2,
  IMPOSSIBLE = 5,
  HYDROGEN_BOMB = 10000000,
}
export class XPGrowth {
  xpGrowthPlan: XPGrowthPlan;
  private constructor(plan: XPGrowthPlan) {
    this.xpGrowthPlan = plan;
  }
  static get(plan: XPGrowthPlan): XPGrowth {
    return new XPGrowth(plan);
  }

  xpGain(
    skillLevel: number,
    challangeLevel: number,
    dificultyInfluence?: ChallangeDificultyXPInfluence
  ): number {
    const difficultyXpInfluence =
      dificultyInfluence || ChallangeDificultyXPInfluence.NORMAL;
    const xpBase = this.xpGrowthPlan.baseGoal;

    const linearGoal = Math.ceil(
      xpBase +
        (challangeLevel - 1) *
          (xpBase * this.xpGrowthPlan.percentualBaseGoalIncrement)
    );
    const simpleGrowthAmountSection = Math.ceil(
      linearGoal / this.xpGrowthPlan.aimedBaseMatches
    );
    const levelDifference = challangeLevel - skillLevel;
    const levelDifferenceAmount =
      levelDifference * this.xpGrowthPlan.levelDifferenceInfluence;
    return Math.max(
      Math.ceil(
        (simpleGrowthAmountSection + levelDifferenceAmount) *
          difficultyXpInfluence
      ),
      1
    );
  }
  xpToUp(skillLevel: number): number {
    const xpBase = this.xpGrowthPlan.baseGoal;

    const growthAmountSection = xpBase / this.xpGrowthPlan.aimedBaseMatches;

    const stepeningCurve = Math.exp(
      (skillLevel + growthAmountSection) /
        (this.xpGrowthPlan.aimedBaseMatches * 10)
    );
    const multipliers =
      (skillLevel - 1) *
      (xpBase * this.xpGrowthPlan.percentualBaseGoalIncrement) *
      (1 + stepeningCurve);
    const linearGoal = Math.ceil(xpBase + multipliers);
    const simpleValue = Math.ceil(linearGoal);
    const visualAdjustment =
      simpleValue % this.xpGrowthPlan.goalVisualMultiplierAdjustment;
    const adjustedValue = Math.ceil(simpleValue - visualAdjustment);
    return adjustedValue;
  }
}
