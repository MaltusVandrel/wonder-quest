import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GameDataService } from '@/services/game-data.service';
import { GaugeCalc } from '@/models/gauge';

interface StatusPanelProps {
  onOpenCompany?: () => void;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ onOpenCompany }) => {
  const { t } = useTranslation();
  const [staminaPercent, setStaminaPercent] = useState(0);

  useEffect(() => {
    const update = () => {
      const stamina = GameDataService.GAME_DATA.companyData.stamina;
      const percent = parseInt(
        GaugeCalc.getPercentualValueString(GameDataService.GAME_DATA.companyData, stamina),
        10
      );
      setStaminaPercent(percent);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ui-element ui-panel ui-display-row ui-pos-topright">
      <div className="ui-display-row">
        <button
          className="ra ra-player ui-game-button dark-primary-text-color"
          onClick={onOpenCompany}
          type="button"
          aria-label={t('game.openCompany')}
        />
      </div>
      <div className="ui-display-column">
        <small>
          <label htmlFor="gauge-stamina">{t('game.stamina')}: </label>
          <output id="gauge-stamina-value" name="gauge-stamina" style={{ float: 'right' }}>
            {staminaPercent}%
          </output>
        </small>
        <meter
          id="gauge-stamina-meter"
          min={0}
          max={100}
          low={25}
          high={55}
          optimum={85}
          value={staminaPercent}
          className="ui-width-100"
          style={{ opacity: 0.6 }}
        />
      </div>
    </div>
  );
};
