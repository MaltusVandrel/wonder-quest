import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { GameDataService } from '@/services/game-data.service';
import { GaugeKey } from '@/models/gauge';
import { COMPANY_POSITION } from '@/models/company';
import { Actor } from '@/models/actor';

interface RestButtonProps {
  onRest?: () => void;
}

export const RestButton: React.FC<RestButtonProps> = ({ onRest }) => {
  const { t } = useTranslation();

  const handleRest = useCallback(() => {
    const stamina = GameDataService.GAME_DATA.companyData.stamina;
    stamina.consumed = 0;
    GameDataService.GAME_DATA.time += 8 * 60;
    GameDataService.GAME_DATA.companyData.members.forEach(
      (member: { character: Actor; positions: COMPANY_POSITION[] }) => {
        Object.keys(member.character.gauges).forEach(
          (gaugeKey) => (member.character.gauges[gaugeKey as GaugeKey].consumed = 0)
        );
      }
    );
    onRest?.();
  }, [onRest]);

  return (
    <button className="ui-element ui-game-button rest-button" onClick={handleRest} type="button">
      {t('game.rest')}
    </button>
  );
};
