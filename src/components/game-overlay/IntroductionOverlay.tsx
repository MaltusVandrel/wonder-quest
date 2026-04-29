import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FigureName, NAMES } from '@/data/bank/names';
import { HERO_BUILDER } from '@/data/builder/hero-builder';
import { GameDataService } from '@/services/game-data.service';
import { Actor } from '@/models/actor';
import { Stat, StatCalc, StatKey } from '@/models/stats';
import { COMPANY_POSITION } from '@/models/company';

type Step = 'name-selection' | 'introduction-text';

interface IntroductionSceneLike {
  scene: { isActive: () => boolean };
  isContinue?: boolean;
  fadeOutAndDestroy: () => void;
}

export const IntroductionOverlay: React.FC = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isContinue, setIsContinue] = useState(false);
  const [step, setStep] = useState<Step>('name-selection');
  const [hero, setHero] = useState<Actor | null>(null);
  const [, setHeroMonth] = useState(1);

  const popedNames = useMemo(() => {
    const names = [...NAMES];
    const result: FigureName[] = [];
    let index = 0;
    do {
      const [popped] = names.splice(Math.floor(Math.random() * names.length), 1);
      if (popped) result.push(popped);
      index++;
    } while (index < GameDataService.monthsInAYear && names.length > 0);
    return result;
  }, []);

  useEffect(() => {
    const check = () => {
      const scene = window.game?.scene?.getScene('introduction-scene') as
        | IntroductionSceneLike
        | undefined;
      const active = !!scene?.scene.isActive();
      setIsVisible(active);
      if (active) {
        setIsContinue(!!scene?.isContinue);
      }
    };
    check();
    const interval = setInterval(check, 500);
    return () => clearInterval(interval);
  }, []);

  const handleSelectName = (figureName: FigureName, index: number) => {
    const month = index + 1;
    const newHero = HERO_BUILDER.getAHero(1, {
      name: figureName.name,
      data: {
        genderQualifier: figureName.qualifier,
        month,
      },
    });
    setHero(newHero);
    setHeroMonth(month);
    setStep('introduction-text');
  };

  const handleArise = () => {
    if (!hero) return;
    GameDataService.GAME_DATA.companyData.members.push({
      character: hero,
      positions: [COMPANY_POSITION.LEADER, COMPANY_POSITION.COMBATENT],
    });
    const scene = window.game?.scene?.getScene('introduction-scene') as
      | IntroductionSceneLike
      | undefined;
    scene?.fadeOutAndDestroy?.();
  };

  const statMessage = useMemo(() => {
    if (!hero) return '';
    const stats = (Object.keys(hero.stats) as StatKey[])
      .map((key) => hero.stats[key])
      .sort(
        (a: Stat, b: Stat) =>
          StatCalc.getInfluenceValue(hero, b) - StatCalc.getInfluenceValue(hero, a)
      );
    let unremarkable = true;
    const best = StatCalc.getInfluenceValue(hero, stats[0]);
    const best2 = StatCalc.getInfluenceValue(hero, stats[1]);
    const worst = StatCalc.getInfluenceValue(hero, stats[stats.length - 1]);
    const worst2 = StatCalc.getInfluenceValue(hero, stats[stats.length - 2]);

    let message = hero.name + ' ';
    if (best > 2) {
      message += `shines at their <strong class="capitalize">${stats[0].title}</strong>`;
      if (best2 > 2) {
        message += ` and <strong class="capitalize">${stats[1].title}</strong>`;
      }
      if (worst < 0) {
        message += ' but ';
      }
      unremarkable = false;
    }
    if (worst < 0) {
      message += `is dull at their <strong class="capitalize">${stats[stats.length - 1].title}</strong>`;
      if (worst2 < 0) {
        message += ` and <strong class="capitalize">${stats[stats.length - 2].title}</strong>`;
      }
      unremarkable = false;
    }
    if (unremarkable) {
      message += 'is unremarkable';
    }
    message += '.';
    return message;
  }, [hero]);

  const introTexts = useMemo(() => {
    if (!hero) return [];
    const years = GameDataService.getTimeData().years;
    return [
      t('introduction.realmWelcome', { years }),
      t('introduction.emergedVessel', { name: hero.name }),
      t('introduction.vesselHollow'),
      statMessage,
      t('introduction.crossMist', { name: hero.name }),
    ];
  }, [hero, statMessage, t]);

  if (!isVisible || isContinue) return null;

  return (
    <div className="game-overlay introduction-overlay">
      <div className="ui-element ui-display-column ui-pos-center introduction-panel">
        {step === 'name-selection' && (
          <section className="introduction-main-section">
            <p>{t('introduction.chooseName')}</p>
            <div className="names-holder">
              {popedNames.map((figureName, index) => (
                <button
                  key={`${figureName.name}-${index}`}
                  className="name-option"
                  onClick={() => handleSelectName(figureName, index)}
                  type="button"
                >
                  {figureName.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 'introduction-text' && hero && (
          <>
            <section className="introduction-main-section">
              {introTexts.map((text, index) => (
                <p key={index} dangerouslySetInnerHTML={{ __html: text }} />
              ))}
            </section>
            <menu className="introduction-menu">
              <button className="name-option" onClick={handleArise} type="button">
                {t('introduction.arise')}
              </button>
            </menu>
          </>
        )}
      </div>
    </div>
  );
};
