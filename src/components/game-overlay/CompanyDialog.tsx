import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GameDataService } from '@/services/game-data.service';
import { XPGrowth } from '@/core/xp-calc';
import { Actor } from '@/models/actor';
import { COMPANY_POSITION } from '@/models/company';
import { GAUGE_INFOS, GAUGE_KEYS, Gauge, GaugeCalc, GaugeKey } from '@/models/gauge';
import { STAT_INFOS, STAT_KEY, Stat, StatCalc, StatKey } from '@/models/stats';
import { PhaserBlock } from './PhaserBlock';

interface CompanyDialogProps {
  onClose: () => void;
}

interface MemberEntry {
  character: Actor;
  positions: COMPANY_POSITION[];
}

export const CompanyDialog: React.FC<CompanyDialogProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const company = GameDataService.GAME_DATA.companyData;
  const members: MemberEntry[] = company.members;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [renderTick, setRenderTick] = useState(0);

  const selectedMember = members[selectedIndex];
  const char = selectedMember?.character;

  const forceUpdate = () => setRenderTick((t) => t + 1);

  const handleLevelUp = () => {
    if (!char) return;
    const xpGrowth = XPGrowth.get(char.data.core.growthPlan);
    if (char.data.core.xp < xpGrowth.xpToUp(char.level)) return;

    char.data.core.xp -= xpGrowth.xpToUp(char.level);
    char.level++;
    const karmaInfluence = StatCalc.getInfluenceValue(char, char.stats[STAT_KEY.KARMA]);
    const bonus = Math.max(
      Math.ceil(
        (((char.level + 1) / 4 + karmaInfluence) * (1 + karmaInfluence * Math.random())) / 10
      ),
      1
    );
    char.data.core.skillPoints += char.data.core.growthPlan.skillPointsOnUp + bonus;
    forceUpdate();
  };

  const handleStatUp = (stat: Stat, upCost: number) => {
    if (!char || char.data.core.skillPoints <= upCost) return;
    char.data.core.skillPoints -= upCost;
    stat.value++;
    stat.modValue++;
    forceUpdate();
  };

  if (!char) {
    return (
      <PhaserBlock className="dialog-overlay">
        <div className="dialog-element">
          <button className="dismiss" onClick={onClose} type="button">
            ✕
          </button>
          <section>
            <p>{t('dialog.noMembers')}</p>
          </section>
        </div>
      </PhaserBlock>
    );
  }

  const xpGrowth = XPGrowth.get(char.data.core.growthPlan);
  const xpPercent = Math.min((char.data.core.xp / xpGrowth.xpToUp(char.level)) * 100, 100);
  const canLevelUp = char.data.core.xp >= xpGrowth.xpToUp(char.level);

  return (
    <PhaserBlock className="dialog-overlay">
      <div className="dialog-element dialog-company-element">
        <button className="dismiss" onClick={onClose} type="button">
          ✕
        </button>
        <header>
          <h3>{t('dialog.companyTitle')}</h3>
        </header>
        <section className="company-content">
          <div className="member-button-holder">
            {members.map((member, index) => (
              <button
                key={`${member.character.name}-${index}-${renderTick}`}
                className={`ui-game-button ${index === selectedIndex ? 'active' : ''}`}
                onClick={() => setSelectedIndex(index)}
                type="button"
              >
                {member.character.name}
              </button>
            ))}
          </div>

          <div className="member-panel">
            <h4>
              {char.name}, {t('dialog.level')} {char.level}
            </h4>

            <div className="info-member-panel">
              <div className="first-column-holder">
                <table className="gauge-holder">
                  <tbody>
                    <tr>
                      <td title="xp">
                        <strong>XP:</strong>
                      </td>
                      <td className="gauge-value">
                        <span>
                          <span className={canLevelUp ? 'gold-text' : ''}>{char.data.core.xp}</span>
                          /{xpGrowth.xpToUp(char.level)}
                        </span>
                        <progress className="XP" value={xpPercent} max={100} />
                      </td>
                      {canLevelUp && (
                        <td className="level-up-button-holder">
                          <button
                            className="ui-game-button xsmall"
                            onClick={handleLevelUp}
                            type="button"
                          >
                            &nbsp;⇪&nbsp;
                          </button>
                        </td>
                      )}
                    </tr>
                    {(Object.keys(GAUGE_KEYS) as GaugeKey[]).map((key) => {
                      const gauge: Gauge = char.gauges[key];
                      return (
                        <tr key={key}>
                          <td title={GAUGE_INFOS[key]?.description}>
                            <strong>{gauge.title}:</strong>
                          </td>
                          <td className="gauge-value">
                            <span>{GaugeCalc.getCurrentValueString(char, gauge)}</span>
                            <progress
                              className={key}
                              value={GaugeCalc.getPercentualValue(char, gauge)}
                              max={100}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <hr />
                <p>
                  <strong>{t('dialog.skillPoints')}:</strong> {char.data.core.skillPoints}
                </p>
                <hr />
                <div>
                  <input
                    type="checkbox"
                    id="auto-battle"
                    checked={char.data.configuration.autoBattle}
                    onChange={(e) => {
                      char.data.configuration.autoBattle = e.target.checked;
                      forceUpdate();
                    }}
                  />
                  <label htmlFor="auto-battle">{t('dialog.autoBattle')}</label>
                </div>
              </div>

              <table className="stats-holder">
                <tbody>
                  {(Object.keys(STAT_KEY) as StatKey[]).map((key) => {
                    const stat: Stat = char.stats[key];
                    const upCost = Math.ceil(
                      2 + Math.floor((StatCalc.getInfluenceValue(char, stat) + 0.5) / 4)
                    );
                    const canUpgrade = char.data.core.skillPoints > upCost;

                    return (
                      <tr key={key}>
                        <td title={STAT_INFOS[key]?.description}>
                          <strong>{stat.title}:</strong>
                        </td>
                        <td>{StatCalc.getCurrentValue(char, stat)}</td>
                        <td>
                          (
                          <span
                            className={
                              StatCalc.getInfluenceValue(char, stat) < 0 ? 'negativo' : 'positivo'
                            }
                          >
                            {Math.abs(StatCalc.getInfluenceValue(char, stat))}
                          </span>
                          )
                        </td>
                        {canUpgrade && (
                          <td>
                            <button
                              className="ui-game-button xsmall"
                              onClick={() => handleStatUp(stat, upCost)}
                              type="button"
                            >
                              &nbsp;⇪ ({upCost})
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </PhaserBlock>
  );
};
