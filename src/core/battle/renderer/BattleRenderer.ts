import {
  BattleActionSlot,
  BattleActor,
  BattlePhase,
  BattleTeam,
  RelationshipBehaviour,
} from '@/core/battle/types';
import { GaugeCalc } from '@/models/gauge';
import type { IBattleRenderer } from './IBattleRenderer';

export interface BattleRendererElements {
  textPanel: HTMLElement;
  orderPanel: HTMLElement;
  actionMenu: HTMLElement;
  adversarialTeamsPanel: HTMLElement;
  allyTeamsPanel: HTMLElement;
}

/**
 * @deprecated Implementação legada baseada em manipulação direta de DOM.
 * Preferir o hook useBattleRenderer no lado React.
 */
export class BattleRenderer implements IBattleRenderer {
  private elements: BattleRendererElements;

  constructor(elements: BattleRendererElements) {
    this.elements = elements;
  }

  writeMessage(message: string): void {
    const newP = document.createElement('p');
    newP.innerHTML += message;
    this.elements.textPanel.insertBefore(newP, this.elements.textPanel.childNodes[0]);
  }

  clearMessages(): void {
    this.elements.textPanel.innerHTML = '';
  }

  setIntroductionMessage(text: string): void {
    this.elements.textPanel.innerHTML = `<p>${text}</p>`;
  }

  clearActionMenu(): void {
    this.elements.actionMenu.innerHTML = '';
  }

  addActionButton(label: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.classList.add('ui-game-button');
    button.innerHTML = label;
    button.addEventListener('click', onClick);
    this.elements.actionMenu.appendChild(button);
    return button;
  }

  removeActionButton(button: HTMLButtonElement): void {
    button.remove();
  }

  /** Renderiza o menu de ações de batalha. */
  showActionMenu(actorName: string, options: Array<{ label: string; onSelect: () => void }>): void {
    const title = document.createElement('p');
    title.classList.add('action-menu-title');
    title.innerText = `${actorName}`;
    this.elements.actionMenu.appendChild(title);

    options.forEach((opt) => {
      this.addActionButton(opt.label, opt.onSelect);
    });
  }

  /** @deprecated use `showActionMenu` */
  showActionChoice(actorName: string, onConfirm: () => void): HTMLButtonElement {
    return this.addActionButton('Do Shit ' + actorName + '!', onConfirm);
  }

  /** Renderiza a seleção de alvo para ataques. */
  showTargetSelection(
    targets: BattleActor[],
    onSelectTarget: (target: BattleActor) => void,
    onCancel?: () => void
  ): void {
    this.clearActionMenu();

    const title = document.createElement('p');
    title.classList.add('action-menu-title');
    title.innerText = 'Escolha o alvo';
    this.elements.actionMenu.appendChild(title);

    targets.forEach((target) => {
      const label = `${target.character.name} (${target.team.name})`;
      this.addActionButton(label, () => onSelectTarget(target));
    });

    if (onCancel) {
      this.addActionButton('← Voltar', onCancel);
    }
  }

  toNameKey(name: string): string {
    return name.trim().toLocaleLowerCase().replaceAll(' ', '-');
  }

  actionSlotToElementUI(actionSlot: BattleActionSlot): void {
    const actor = actionSlot.battleActor;
    const el = document.createElement('p');
    el.id = actionSlot.id;
    el.innerHTML = `${actor.character.name}`;
    el.classList.add(
      'turn-slot',
      `turn-slot-${this.toNameKey(actor.team.name)}-${this.toNameKey(actor.character.name)}`
    );
    this.elements.orderPanel.appendChild(el);
  }

  setOrderActionListUI(): void {
    const elements = this.elements.orderPanel.getElementsByClassName('turn-slot');
    Array.from(elements).forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });
    Array.from(elements)
      .slice(0, 15)
      .forEach((el) => {
        (el as HTMLElement).style.display = 'block';
      });
  }

  clearOrderPanel(): void {
    this.elements.orderPanel.innerHTML = '';
  }

  clearTeamPanels(): void {
    this.elements.adversarialTeamsPanel.innerHTML = '';
    this.elements.allyTeamsPanel.innerHTML = '';
  }

  removeActionSlotById(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('shrink-slide-out');
      el.classList.add('shrink-slide-out');
      setTimeout(() => {
        el.remove();
      }, 300);
    }
  }

  removeActionFromUI(actionSlot: BattleActionSlot): void {
    this.removeActionSlotById(actionSlot.id);
  }

  removeActorSlotsFromUI(actor: BattleActor): void {
    const elements = document.getElementsByClassName(
      `turn-slot-${this.toNameKey(actor.team.name)}-${this.toNameKey(actor.character.name)}`
    );
    Array.from(elements).forEach((el) => el.remove());
  }

  showHitTakenOnTargetUI(): void {
    // TODO: implement visual hit feedback
    // This was previously a no-op or CSS class addition
  }

  updateTeamInfoUI(teams: BattleTeam[], retreatedTeams: BattleTeam[]): void {
    const adversarialTeams = teams.filter((team) => !team.supporter);
    const supporterTeams = teams.filter((team) => team.supporter);

    adversarialTeams.forEach((team) => {
      this.doTeamHolderUI(team, this.elements.adversarialTeamsPanel);
    });
    supporterTeams.forEach((team) => {
      this.doTeamHolderUI(team, this.elements.allyTeamsPanel);
    });

    retreatedTeams.forEach((team) => {
      const el = document.getElementById(team.id);
      if (el) {
        // TODO: animar saída de times retirados
      }
    });
  }

  private doTeamHolderUI(team: BattleTeam, teamHolderPanel: HTMLElement) {
    let teamPanel = document.getElementById(team.id);
    let teamPanelExists = true;
    if (!teamPanel) {
      teamPanelExists = false;
      teamPanel = document.createElement('div');
      teamPanel.id = team.id;
    }
    teamPanel.classList.add('team');
    if (team.supporter) teamPanel.classList.add('supporter');
    if (team.adversarial) teamPanel.classList.add('adversarial');
    if (
      team.relationships.filter(
        (rel) => rel.team.isPlayer && rel.behaviour >= RelationshipBehaviour.FOE
      ).length > 0
    ) {
      teamPanel.classList.add('foe');
    }
    if (
      team.relationships.filter(
        (rel) => rel.team.isPlayer && rel.behaviour === RelationshipBehaviour.ALLY
      ).length > 0
    ) {
      teamPanel.classList.add('ally');
    }
    if (team.isPlayer) {
      teamPanel.classList.add('player');
    }

    team.actors.forEach((actor) => {
      const chara = actor.character;
      let actorEl = document.getElementById(actor.character.id);
      let actorElPanelExists = true;
      if (!actorEl) {
        actorElPanelExists = false;
        actorEl = document.createElement('div');
        actorEl.id = actor.character.id;
        const actorText = document.createElement('p');
        actorEl.appendChild(actorText);
      }
      actorEl.getElementsByTagName('p')[0].innerHTML = `<strong>${
        chara.name
      }</strong> ${GaugeCalc.getCurrentValueString(chara, chara.gauges.VITALITY)}`;

      actorEl.classList.add('actor');
      if (chara.isFainted()) {
        actorEl.classList.add('defeated');
      }

      if (!actorElPanelExists) teamPanel!.appendChild(actorEl);
    });
    if (!teamPanelExists) teamHolderPanel.appendChild(teamPanel);
  }

  get elementsRef(): BattleRendererElements {
    return this.elements;
  }
}
