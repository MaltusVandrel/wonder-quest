# WonderQuest - Blueprint Técnico para Projeto Análogo

> ⚠️ **AVISO: Este documento está DESATUALIZADO.** O projeto foi migrado de Angular para **Vite + React + TypeScript + Redux Toolkit + i18n + Phaser + SCSS**. As referências à Angular, `@angular`, `AppComponent`, `app.module.ts`, `angular.json`, etc. não refletem a stack atual. Consulte `AGENTS.md` para a arquitetura vigente.
>
> Documento gerado a partir da análise do projeto WonderQuest.
> Contém schemas, estruturas, conexões e arquitetura para replicação/expansão.

---

## 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Angular (Shell App)                       │
│  • AppComponent: inicializa Phaser.Game                      │
│  • GameDataService: estado global estático + Save/Load       │
│  • MessageHandler: fila de mensagens HTML sanitizadas        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Phaser 3 (Game Engine)                    │
│  • Scenes: Menu → Intro → Mapa (com sub-scenes)              │
│  • Renderização: tiles, partículas, textos, câmera           │
│  • Input: mouse/touch interativo no grid                     │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│              DOM/HTML Custom Elements (UI)                   │
│  • Menus, diálogos, batalha, status, toasts                 │
│  • Web Components estendendo HTMLDialogElement              │
│  • Manipulação imperativa do DOM (não Angular components)   │
└─────────────────────────────────────────────────────────────┘
```

**Padrão arquitetural:** Híbrido Angular + Phaser. Angular é apenas o shell. Toda a lógica de jogo vive em TypeScript puro (models, core, utils) e Phaser Scenes.

---

## 2. Estrutura de Diretórios Esperada

```
src/
├── app/
│   ├── app.component.ts          # Inicializa Phaser.Game, registro de scenes
│   ├── app.component.html        # <div id="phaser-game"> + <div id="toast-holder">
│   └── app.module.ts             # BrowserModule apenas
├── scenes/
│   ├── main-menu.scene.ts        # Menu inicial, partículas, botões DOM
│   ├── introduction.scene.ts     # Intro narrativa, criação de personagem
│   ├── map.scene.ts              # Mapa procedural principal, grid de tiles
│   ├── map.player.scene.ts       # Representação visual do jogador
│   ├── map.path.scene.ts         # Pathfinding e movimentação passo a passo
│   └── map.ui.scene.ts           # Overlay de UI no canvas (hora, tile info)
├── core/
│   ├── context.ts                # Classe base abstrata, registry global
│   ├── battle-context.ts         # Motor de batalha completo (ATB)
│   ├── battle-context.attack.ts  # Mini-VM de execução de ataques
│   ├── battle-instructions.ts    # IA de batalha (Strategy pattern)
│   ├── message-handler.ts        # Fila de mensagens HTML
│   ├── ui-element.ts             # Constantes de alinhamento UI
│   └── xp-calc.ts                # Cálculo de XP e níveis
├── models/
│   ├── actor.ts                  # Entidade personagem/NPC
│   ├── company.ts                # Grupo/party do jogador
│   ├── child-component.ts        # Classe base para componentes filhos
│   ├── gauge.ts                  # Definições e cálculos de gauges
│   ├── stats.ts                  # Definições e cálculos de 16 stats
│   ├── move.ts                   # Sistema de movimentos/ataques (DSL)
│   ├── property.ts               # Propriedades/etiquetas de classificação
│   ├── item.ts                   # Placeholder sistema de itens
│   ├── skill.ts                  # Placeholder sistema de skills
│   ├── biome.ts                  # Interface de bioma
│   ├── zone.ts                   # Interface de zona no mapa
│   └── zone-resource.ts          # Recursos encontrados em zonas
├── data/
│   ├── bank/
│   │   ├── biome.ts              # 19 biomas + função chooseBiome()
│   │   ├── encounter.ts          # Encontros por bioma + checagem
│   │   ├── map-region.ts         # Geração de regiões nomeadas
│   │   ├── names.ts              # Banco de ~800 nomes procedurais
│   │   ├── item-type.ts          # Hierarquia de tipos de item
│   │   ├── gauge.ts              # (placeholder)
│   │   └── stats.ts              # (placeholder)
│   ├── builder/
│   │   ├── hero-builder.ts       # Factory de herói
│   │   ├── slime-builder.ts      # Factory de slime
│   │   ├── stats-setter.ts       # Distribuição aleatória de stats
│   │   └── gauge-setter.ts       # Inicialização de gauges
│   ├── map-data.json             # Grid numérico de tiles (exemplo)
│   └── map-definitions.json      # Mapeamento de tipos de tile
├── utils/
│   ├── map-generator.utils.ts    # Geração procedural (fBm + Simplex)
│   ├── map-path.utils.ts         # Pathfinding guloso/custo-mínimo
│   ├── calc.utils.ts             # Utilitários matemáticos e IDs
│   ├── color.utils.ts            # Conversões de cor
│   ├── ui-elements.util.ts       # Montagem de UI DOM
│   └── ui-notification.util.ts   # Sistema de diálogos/toasts (Web Components)
├── services/
│   └── game-data.service.ts      # Estado global estático + Save/Load
├── assets/
│   ├── tiles.png / tiles.xcf     # Tileset (preparado para futuro uso)
│   ├── particula.png             # Sprite de partícula
│   ├── cursor.png                # Cursor customizado
│   ├── fonts/                    # Caviar Dreams, Monocraft, RPG Awesome
│   └── img/bg/placeholder.png    # Background placeholder
└── environments/                 # Padrão Angular (prod/dev flags)
```

---

## 3. Schemas de Dados (Models)

### 3.1 Stats

```typescript
// Enum de chaves (16 stats)
const STAT_KEY = {
  STRENGTH: 'STRENGTH',
  ENDURANCE: 'ENDURANCE',
  VIGOR: 'VIGOR',
  AGILITY: 'AGILITY',
  DEXTERITY: 'DEXTERITY',
  PERCEPTION: 'PERCEPTION',
  INTELLIGENCE: 'INTELLIGENCE',
  CUNNING: 'CUNNING',
  RESOLVE: 'RESOLVE',
  CHARISMA: 'CHARISMA',
  INTUITION: 'INTUITION',
  LUCK: 'LUCK',
  POTENCY: 'POTENCY',
  RESISTENCE: 'RESISTENCE',
  ESOTERISM: 'ESOTERISM',
  KARMA: 'KARMA',
} as const;
type StatKey = keyof typeof STAT_KEY;

// Interface
interface Stat {
  key: string;
  title: string;
  value: number;      // valor base
  modValue: number;   // valor modificado
}

const defaultStat: Stat = { key: 'base', title: 'base', value: 10, modValue: 10 };

// Utilitário de cálculo
class StatCalc {
  static getCurrentValue(parent: Actor | Company, stat: Stat): number;
  static getInfluenceValue(parent: Actor | Company, stat: Stat): number; // (value - 10) / 2
}
```

### 3.2 Gauges

```typescript
const GAUGE_KEYS = {
  VITALITY: 'VITALITY',   // HP
  STAMINA: 'STAMINA',     // Exploração / Ações
  MANA: 'MANA',           // Magia
} as const;
type GaugeKey = keyof typeof GAUGE_KEYS;

interface Gauge {
  key: string;
  title: string;
  value: number;      // valor máximo base
  consumed: number;   // "dano" sofrido no gauge
}

const defaultGauge: Gauge = { key: 'base', title: 'base', value: 80, consumed: 0 };

// Modificadores: cada gauge é influenciado por stats com pesos diferentes
const GAUGE_MODFIERS: { [key in GaugeKey]: { [key in StatKey]: number } } = {
  VITALITY: { VIGOR: 7, ENDURANCE: 7, RESOLVE: 5, RESISTENCE: 5, STRENGTH: 2.5, ... },
  STAMINA: { ENDURANCE: 7, VIGOR: 5, DEXTERITY: 5, AGILITY: 5, RESISTENCE: 5, ... },
  MANA: { POTENCY: 7, INTELLIGENCE: 7, ESOTERISM: 7, KARMA: 7, VIGOR: 5, ... },
};

class GaugeCalc {
  static getPercentualValue(parent: Actor | Company, gauge: Gauge): number;
  static getCurrentValue(parent: Actor | Company, gauge: Gauge): number; // value - consumed
  static getValue(parent: Actor | Company, gauge: Gauge): number;        // valor máximo calculado
  static canHandleValue(value: number, parent: Actor | Company, gauge: Gauge): boolean;
}
```

### 3.3 Actor (Personagem/NPC)

```typescript
interface FigureData {
  core: {
    xp: number;
    skillPoints: number;
    growthPlan: XPGrowthPlan;
  };
  configuration?: any;  // ex: { autoBattle: false }
  extra?: any;
}

class Actor {
  id: string;                    // gerado por timestamp
  name: string;
  level: number;
  data: FigureData;
  gauges: Record<GaugeKey, Gauge>;
  stats: Record<StatKey, Stat>;

  static untieCircularReference(figure: Actor): any;
  static instantiate(data: any): Actor;

  isFainted(): boolean;          // vitality current <= 0
  getInitiative(): number;       // = getActionSpeed()
  getNormalSpeed(): number;      // baseado em AGI*2.5 + DEX + PRC + ITT / 2.5
  getActionSpeed(): number;      // normalSpeed + rand(LUK influence) + level/4
}
```

### 3.4 Company (Party/Grupo)

```typescript
enum COMPANY_POSITION {
  LEADER = 'LEADER',
  COMBATENT = 'COMBATENT',
  DEFENSOR = 'DEFENSOR',
  WORKER = 'WORKER',
  GUEST = 'GUEST',
  PROTECTED = 'PROTECTED',
  PRISIONER = 'PRISIONER',
}

class Company {
  title: string;
  members: Array<{ character: Actor; positions: COMPANY_POSITION[] }>;
  inventory: Item[];
  stamina: Gauge;                // stamina coletiva (média ponderada dos membros)

  static untieCircularReference(figure: Company): any;
  static instantiate(data: any): Company;
}

interface CompanyTeam {
  members: Actor[];
  type: COMPANY_POSITION;
}
```

### 3.5 Moves (Sistema de Ataques Data-Driven)

```typescript
enum MoveType { MOVE = 'move', SPELL = 'spell', ART = 'art', TECHNIC = 'technic', SKILL = 'skill' }
enum MoveLearningStatus { CONCEPTUALIZED = 'conceptualized', LEARNED = 'learned', MASTERED = 'mastered' }
enum MoveClassificationType { DAMAGE = 'damage', HEALING = 'healing', EFFECT = 'effect', OTHER = 'other' }

interface StatInfluence {
  stat: StatKey;
  influence: number;
}

// Linguagem de script embutida (Mini-VM)
type MoveBehaviour =
  | { type: 'GET'; key: string; value: string }           // avalia expressão e armazena
  | { type: 'CONDITION'; check: string; then: MoveBehaviour[]; else?: MoveBehaviour[] }
  | { type: 'APPLY'; target: string; key: string; op: 'add' | 'sub' | 'set'; value: string }
  | { type: 'HIT'; action: string; key: string; value: string };

interface MoveExpression {
  moveKey: string;
  type: MoveType;
  name: string;
  description: string;
  level: number;
  xp: number;
  learned: MoveLearningStatus;

  // Stats de combate
  power: number;
  hitChance: number;
  overHitInfluence: number;
  criticalChance: number;
  criticalMultiplier: number;

  // Multi-ataque
  isMultiAttack: boolean;
  multiAttackMaxHits: number;
  multiAttackEndOnMiss: boolean;
  multiAttackHitChanceOnHitInfluence: number;
  multiAttackOverHitOnHitInfluence: number;
  multiAttackPowerOnHitInfluence: number;
  multiAttackCriticalChanceOnHitInfluence: number;
  multiAttackCriticalOnHitInfluence: number;

  // Custo
  gaugeCostInfluenceOnFumble: number;
  gaugeCostInfluenceOnDodge: number;
  gaugeCosts: Array<{ gauge: GaugeKey; cost: number; costReduction: Array<StatInfluence> }>;

  // Influências de status
  statusInfluence: Array<StatInfluence>;
  hitStatus: Array<StatInfluence>;
  critStatus: Array<StatInfluence>;
  dodgingStatus: Array<StatInfluence>;
  resistenceStatus: Array<StatInfluence>;
  characteristics: Array<Property>;

  // Passos da mini-VM
  steps: Array<MoveBehaviour>;
}

interface Move {
  key: string;
  name: string;
  defaultExpression: MoveExpression;
}
```

### 3.6 Property (Etiquetas/Tags)

```typescript
interface Property {
  key: string;
  name: string;
}

// Exemplo:
const PROPERTY_LIST: { [key: string]: Property } = {
  damage_type_impact: { key: 'dmg.type.impact', name: 'impact' },
};
```

### 3.7 Item (Placeholder)

```typescript
class Item {}  // placeholder para futuro sistema de itens
```

### 3.8 Zone / ZoneResource

```typescript
interface MapZone {
  influence: number;            // "saúde" da zona
  biomeBoundIntensity: number;  // chance de spread do bioma
  originBoundIntensity: number; // chance de spread da origem
  origin: { x: number; y: number };
}

class ZoneResource {
  supply: Gauge;
  item: Item;
}
```

### 3.9 Biome

```typescript
enum BIOME_TYPES {
  DEEP_WATERS = 'Deep Waters',
  SHALLOW_WATERS = 'Shallow Waters',
  REEFS = 'Reefs',
  BEACH = 'Beach',
  CLIFF = 'Cliff',
  MARSH = 'Marsh',
  DUNES = 'Dunes',
  DESERT = 'Desert',
  HILLS = 'Hills',
  PLAINS = 'Plains',
  HIGH_GRASS = 'High Grass',
  GROVE = 'Grove',
  WOODS = 'Woods',
  ENCHANTED_WOODS = 'Enchanted Woods',
  SWAMP = 'Swamp',
  MOUNTAINS = 'Mountains',
  HIGH_MOUNTAINS = 'High Mountains',
  SNOWY_PEAKS = 'Snowy peaks',
  VOID = 'Void',
}

interface Biome {
  type: BIOME_TYPES;
  color: number;           // hex integer
  staminaCost: number;
  timeCost: number;
  regionId?: string;
  influenceValues?: {
    elevation: number;
    moisture: number;
    temperature: number;
    localVariation: number;
    wonder: number;
  };
}
```

---

## 4. Schemas do Core (Sistemas Centrais)

### 4.1 Context (Registry Base)

```typescript
export abstract class Context {
  static ACTIVE_CONTEXTS: { [key: string]: any } = {};
  public type: string;
  constructor(type: string) {
    this.type = type;
    Context.ACTIVE_CONTEXTS[this.type] = this;
  }
}
```

### 4.2 Battle Context (Motor de Batalha ATB)

```typescript
// Enum de tipos de ação
enum BattleActionType { FLEE, ATTACK, WAIT }

// Enum de eventos de batalha
enum BATTLE_EVENT_TYPE {
  BEFORE_BATTLE_START,
  TURN_START,
  TURN_END,
  BEFORE_ACTION,
  AFTER_ACTION,
  ON_ARRIVAL,
  ON_AGGRESSION,
  ON_SLAIN,
  ON_DEMISSE,
  ON_TEAM_RETREAT,
  AFTER_BATTLE_END,
}

// Time em batalha
interface BattleTeam {
  id: string;
  name: string;
  key: string;
  actors: Array<BattleActor>;
  actionBehaviour: number;      // PLAYER=0, AUTO=1
  isPlayer: boolean;
  relationships: Array<TeamRelationship>;
  disadvantage: boolean;
  adversarial: boolean;
  supporter: boolean;
}

interface TeamRelationship {
  team: BattleTeam;
  behaviour: number;            // ALLY=-1, PLAYER=0, FOE=1
}

// Ator em batalha (wrapper de Actor)
interface BattleActor {
  character: Actor;
  team: BattleTeam;
  speed: number;
  progress: number;             // progresso no turno
  isAuto: boolean;
  arrivalTurn: number;
  legendaryActions: number;
  dificulty: ChallangeDificultyXPInfluence;
  fainted: boolean;
  battleInstructions: BattleInstruction;
}

interface BattleActorSchema {
  character: Actor;
  fainted?: boolean;
  legendaryActions?: number;
  dificulty?: ChallangeDificultyXPInfluence;
  battleInstructions?: BattleInstruction;
}

// Slot de ação (quando o ator atua)
interface BattleActionSlot {
  id: string;
  battleActor: BattleActor;
  speed: number;
  timeStamp: number;
  localProgress: number;
}

// Instrução de IA (Strategy Pattern)
interface BattleInstructionExpression {
  actionType: BattleActionType;
  move?: MoveExpression;
  self?: boolean;
  teamTargets?: Array<Array<BattleTeam>>;
  actorTargets?: Array<Array<BattleActor>>;
  battleActionTargets?: Array<Array<BattleActionSlot>>;
}

interface BattleInstruction {
  (battle: BattleContext, self: BattleActor): BattleInstructionExpression;
}

// Grupo para montar batalha
interface BattleGroup {
  members: Array<BattleActorSchema>;
  teamName: string;
  teamKey: string;
  actionBehaviour: number;
  relationships: Array<{ teamKey: string; behaviour: number }>;
  disavantage: boolean;
  adversarial: boolean;
  supporter: boolean;
}

// Evento recorrente na batalha
interface BattleEvent {
  type: BATTLE_EVENT_TYPE;
  startingTurn: number;
  turnGapForRecurrence: number;
  calculatedOccurence: boolean;
  getNextTurnToOccur?: (battle: BattleContext) => number;
  nextTurnToOccur?: number;
  event: (battle: BattleContext, itself: BattleEvent) => {
    stopBattle?: boolean;
    stopAll?: boolean;
    message?: string;
  };
}

// Esquema de batalha (entrada para criar uma batalha)
interface BattleScheme {
  groups: Array<BattleGroup>;
  introductionText?: string;
  endText?: string;
  events: Array<BattleEvent>;
  playerDisadvantage: boolean;
}

// Info do turno atual
interface BattleTurnInfo {
  turn?: number;
  activeSlot?: BattleActionSlot;
  activeActor?: BattleActor;
  activeMove?: any;
  aimedActor?: BattleActor;
  isPlayer?: boolean;
  isMove?: boolean;
  isHeal?: boolean;
  moves: any[];
}

// Classe principal
class BattleContext extends Context {
  static TEAM_KEY_PLAYER: string = 'player';
  static DISADVANTAGE_INFLUENCE: number = 5;
  static RELATIONSHIP_BEHAVIOUR = { ALLY: -1, PLAYER: 0, FOE: 1 };
  static ACTION_BEHAVIOUR = { PLAYER: 0, AUTO: 1 };
  static WAIT_TIME = 1;

  // Propriedades
  actionSlots: Array<BattleActionSlot> = [];
  battleActors: Array<BattleActor> = [];
  battleTeams: Array<BattleTeam> = [];
  timeProgress: number = 0;
  sets: number = 0;
  turn: number = 0;
  turnDuration: number = 0;
  scheme: BattleScheme;
  events: BattleEvent[] = [];
  turnInfo: BattleTurnInfo;
  turnInfoHistory: Array<BattleTurnInfo> = [];
  actionSlotHistory: Array<BattleActionSlot> = [];
  retreatedTeams: Array<BattleTeam> = [];
  onEndCallback: () => void;

  // UI elements (DOM)
  textPanel: HTMLElement;
  orderPanel: HTMLElement;
  actionMenu: HTMLElement;
  adversarialTeamsPanel: HTMLElement;
  allyTeamsPanel: HTMLElement;

  // Métodos principais
  static build(...panels, scheme: BattleScheme): BattleContext;
  async start(): Promise<void>;                    // inicia a batalha
  async unravelBattle(): Promise<void>;            // loop principal de turnos
  doTeams(): void;                                 // monta times a partir do scheme
  doActionList(): void;                            // popula actionSlots baseado em velocidade
  async triggerEvents(type: BATTLE_EVENT_TYPE): Promise<boolean>;
  async markFaintedActors(): Promise<void>;        // aplica XP, checa fainted
  async retreatFoelessTeams(): Promise<void>;      // remove times sem inimigos
  async doEndOrNextTurn(currentTeam: BattleTeam): Promise<void>;

  // Relacionamentos entre times
  getAllyTeams(team: BattleTeam): Array<BattleTeam>;
  getSupportiveTeams(team: BattleTeam): Array<BattleTeam>;
  getEnemyTeams(team: BattleTeam): Array<BattleTeam>;
  getAdversarialTeams(team: BattleTeam): Array<BattleTeam>;
  getBeneficialTeams(team: BattleTeam): Array<BattleTeam>;
  getDetrimentalTeams(team: BattleTeam): Array<BattleTeam>;

  // Helpers
  isThereAnyAnimosity(): boolean;
  isThereAnyAdversaryAlive(team: BattleTeam): boolean;
  chooseAction(char: Actor): Promise<BattleInstructionExpression>;
  removeActorFromBattle(actorToRemove: BattleActor): void;
  async addNewBattleActor(timeStamp: number, actorSchema: BattleActorSchema, team: BattleTeam): Promise<void>;
  static delay(ms?: number): Promise<any>;
}
```

### 4.3 Sistema de Ataque (Mini-VM)

```typescript
// Função principal
async function doAttack(
  battle: BattleContext,
  char: Actor,
  battleInstructionExpression: BattleInstructionExpression
): Promise<void>;

// Internamente, a VM executa:
// 1. Flatten de contexto: { source, target, random, random_1...random_10 }
// 2. Avaliação de expressões com Function("use strict";return (...))
// 3. Execução de steps: GET → CONDITION → HIT → APPLY

// Exemplo de MoveBehaviour (MoveBonk):
steps: [
  { type: 'GET', key: 'reduction', value: '$target.stats.ENDURANCE.value * 0.1' },
  { type: 'GET', key: 'damage', value: '$source.stats.STRENGTH.value * 2' },
  { type: 'GET', key: 'hit', value: '$random' },
  {
    type: 'CONDITION',
    check: '$hit > 0.3',
    then: [{ type: 'HIT', action: 'bonked', key: 'hit', value: '$damage - $reduction' }],
    else: [{ type: 'HIT', action: 'bruised', key: 'hit', value: '1' }],
  },
]
```

### 4.4 Sistema de XP

```typescript
interface XPGrowthPlan {
  baseGoal: number;                        // XP base (ex: 100)
  aimedBaseMatches: number;                // encontros para upar (ex: 6)
  percentualBaseGoalIncrement: number;     // incremento por nível (ex: 0.125)
  goalVisualMultiplierAdjustment: number;  // ajuste visual (ex: 5)
  levelDifferenceInfluence: number;        // influência de diferença de lvl (ex: 2.5)
  firstSoftLevelCap: number;               // primeiro soft cap (ex: 50)
  recurringGoalPostSoftLevelCap: number;   // meta pós-soft cap (ex: 25)
  skillPointsOnUp: number;                 // pontos por up (ex: 16)
}

const defaultXPGrowthPlan: XPGrowthPlan = {
  baseGoal: 100,
  aimedBaseMatches: 6,
  percentualBaseGoalIncrement: 0.125,
  goalVisualMultiplierAdjustment: 5,
  levelDifferenceInfluence: 2.5,
  firstSoftLevelCap: 50,
  recurringGoalPostSoftLevelCap: 25,
  skillPointsOnUp: 16,
};

enum ChallangeDificultyXPInfluence {
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

class XPGrowth {
  static get(plan: XPGrowthPlan): XPGrowth;
  xpGain(skillLevel: number, challangeLevel: number, dificultyInfluence?: ChallangeDificultyXPInfluence): number;
  xpToUp(skillLevel: number): number;
}
```

---

## 5. Schemas de Dados do Jogo (Data Layer)

### 5.1 Banco de Biomas

```typescript
const BIOMES: { [key in BIOME_TYPES]: Biome } = { ... };
const BIOME_DEFAULTS = { staminaCost: 15, timeCost: 15 };

function chooseBiome(
  elevation: number,    // 0-1
  moisture: number,     // 0-1
  temperature: number,  // 0-1
  localVariation: number, // 0-1
  wonder: number,       // 0-1
  x?: number,
  y?: number
): Biome;
```

### 5.2 Banco de Encontros

```typescript
interface GameActionResult {
  able?: boolean;
  result?: string;
  keepParentOpen?: boolean;
  reason?: string;
  dialogType?: DIALOG_TYPES;
  customReturnBehaviour?: (params: OverallGameDataParamter) => void;
}

interface GameAction {
  title: string;
  hint?: string;
  action: (params: OverallGameDataParamter) => GameActionResult;
  isAble: (params: OverallGameDataParamter) => GameActionResult;
}

interface EncounterScheme {
  key: string;
  title: string;
  description: string | Array<string>;
  chance: number;              // probabilidade de trigger
  demandsAttention: boolean;   // abre diálogo modal
  blocksOtherEncounters?: boolean;
  priority?: number;
  canDismiss?: boolean;
  actions?: Array<GameAction>;
  onTrigger?: (data: OverallGameDataParamter) => void;
  canTrigger?: (data: OverallGameDataParamter) => boolean;
}

interface Encounter {
  // Mesmo que EncounterScheme + overallGameDataParamter fixado
  overallGameDataParamter: OverallGameDataParamter;
}

const ENCOUNTERS: { [key in BIOME_TYPES]: Array<EncounterScheme> } = {
  [BIOME_TYPES.PLAINS]: [ /* Funny Bunny, fox.wolf.bunny, etc. */ ],
  // ... outros biomas vazios no momento
};

function checkIfEncountersHappensOnTravel(x: number, y: number): Array<Encounter> | null;
```

### 5.3 Regiões do Mapa

```typescript
interface MapRegion {
  id: number;
  name: string;                // gerado proceduralmente
  seedBiomeType: BIOME_TYPES;
  seedTile: { x: number; y: number };
  relativeBiomes: Array<BIOME_TYPES>;
  tiles: Array<{ x: number; y: number }>;
  tileLimit: number;
  funDebugColor: number;
  hitBox?: { topLeft: { x; y }; bottomRight: { x; y } };
}

function getRegionSeed(x: number, y: number, biome: Biome): number;
function getRegionName(x: number, y: number, biome: Biome): string;
// Nome = adjetivo (good/neutral/bad baseado em wonder) + biome.type
```

### 5.4 Builders

```typescript
// Hero Builder
const HERO_BUILDER = {
  getAHero(level: number, data: { name: string }): Actor {
    // setStats(being, 22) — maxValue para distribuição
    // setGauges(being, 100)
  }
};

// Slime Builder
const SLIME_BUILDER = {
  getASlime(level: number): Actor {
    // name = 'Slime'
    // setStats(being, 9 + level)
    // setGauges(being, 60)
  }
};

// Stats Setter
function setStats(being: Actor, maxValue: number): void {
  // Distribui valores aleatórios entre os 16 stats
  // positiveVariance = maxValue - 10 * (1 + 1/3)
  // negativeVariance = (maxValue - 10) / 3
  // value = 10 + rand(positiveVariance) - negativeVariance
}

// Gauge Setter
function setGauges(being: Actor, value?: number): void {
  // Inicializa todos os gauges com valor opcional
}
```

---

## 6. Schemas de Utilitários

### 6.1 Gerador de Mapa (Procedural)

```typescript
class MapGeneratorUtils {
  static seed: String;
  static layers: Array<{
    key: string;        // 'elevation', 'moisture', 'temperature', 'localVariation', 'wonder'
    octaves: number;
    persistence: number;
    lacunarity: number;
    scale: number;
  }> = [
    { key: 'elevation', octaves: 5, persistence: 0.5, lacunarity: 2.0, scale: 100 },
    { key: 'moisture', octaves: 4, persistence: 0.5, lacunarity: 2.0, scale: 150 },
    { key: 'temperature', octaves: 4, persistence: 0.5, lacunarity: 2.0, scale: 130 },
    { key: 'localVariation', octaves: 5, persistence: 0.2, lacunarity: 2.0, scale: 100 },
    { key: 'wonder', octaves: 5, persistence: 0.2, lacunarity: 2.0, scale: 160 },
  ];

  static prngList: any = [];
  static noises: any = [];
  static generatedTilesData: any = [];
  static generatedBiome: Array<Array<Biome>> = [];

  static initSeed(seed: String): void;
  static generateChunk(height: number, width: number, offsetX: number, offsetY: number): void;
  static getBiomeData(x: number, y: number): Biome;
  static generateTilesData(layer: any, x: number, y: number): void;
  static fractalNoise(x, y, noiseFunc, octaves, persistence, lacunarity, scale): number;
  // fBm: soma de octaves de simplex-noise, mapeia [-1,1] → [0,1]
}
```

### 6.2 Pathfinding

```typescript
interface Step {
  x: number;
  y: number;
  cell?: UncoveredCell;
}

interface UncoveredCell {
  stepped?: boolean;
  referenceCost: number;
  staminaCost?: number;
  timeCost?: number;
  x?: number;
  y?: number;
  direction?: number[];
}

class MapPathUtils {
  static DIRECTIONS: Array<Array<number>> = [
    [-1, -1], [0, -1], [1, -1],
    [-1,  0],          [1,  0],
    [-1,  1], [0,  1], [1,  1],
  ];

  static calculatePath(
    playerXOnScreenGridMap: number,
    playerYOnScreenGridMap: number,
    targetCellXOnScreenGridMap: number,
    targetCellYOnScreenGridMap: number,
    screenGridMapHeight: number,
    screenGridMapWidth: number,
    gridMapOffsetX: number,
    gridMapOffsetY: number
  ): Step[];
  // Algoritmo: busca gulosa/custo-mínimo com heurística de distância Manhattan
  // + peso de stamina/time do bioma + modificador diagonal
  // Otimização: cleanAdjacentSteps() remove passos redundantes
}
```

### 6.3 Utilitários de Cálculo

```typescript
class CalcUtil {
  static FUN_NUMBERS = { /* valores de probabilidade nomeados */ };
  static getRandom(max: number): number;
  static coinFlip(): boolean;
  static genId(): string;  // baseado em timestamp
}
```

### 6.4 Utilitários de Cor

```typescript
abstract class ColorUtils {
  static colorToInteger(color: Phaser.Display.Color): number;
  static integerToColor(integer: number): Phaser.Display.Color;
  static integerToHexString(integer: number): string;
}
```

---

## 7. Schema do Serviço de Estado

```typescript
interface TimeData {
  years: number; months: number; days: number;
  hours: number; minutes: number; seconds: number;
}

interface GameData {
  time: number;                          // minutos totais desde início
  companyData: Company;
  mapSeed: string;
  mapPos: { x: number; y: number };     // offset do grid visível
  playerPos: { x: number; y: number };   // posição central do jogador no grid
  screenSize: { x: number; y: number };
  registeredRegions: Array<MapRegion>;
  encounterData: { [key: string]: any }; // dados persistentes de encontros
}

interface OverallGameDataParamter {
  biome?: Biome;
  pos?: { x: number; y: number };
  company?: Company;
  encounterTriggerType?: string;  // 'travel', etc.
  battleScheme?: BattleScheme;
}

class GameDataService {
  static STORAGE_KEY = 'wonder-quest-game-data';
  static INITIAL_TIME = Math.round(Math.random() * 1000 * 364 * 24 * 60);

  // Calendário customizado
  static secondsInAMinute = 60;
  static minutesInAHour = 60;
  static hoursInADay = 24;
  static daysInAMonth = 28;
  static daysInAWeek = 7;         // daysInAMonth / 4
  static daysInASeason = daysInAMonth * 4 + daysInAWeek;
  static monthsInAYear = 13;
  static daysInAYear = daysInAMonth * monthsInAYear;
  static minutesInADay = hoursInADay * minutesInAHour;
  static minutesInAMonth = daysInAMonth * minutesInADay;
  static minutesInAYear = daysInAYear * minutesInADay;

  static GAME_DATA: GameData;

  static getTimeData(totalMinutes?: number): TimeData;
  static getFormattedTime(totalMinutes?: number): TimeData;  // com padding 2 dígitos
  static saveData(): void;      // localStorage, trata circular refs
  static loadData(): void;      // localStorage, reinstantia Company
  static existsData(): boolean;
  static clearData(): void;
}
```

---

## 8. Schemas de Cenas (Phaser)

### 8.1 MainMenuScene

```typescript
class MainMenuScene extends Phaser.Scene {
  key = 'main-menu-scene';
  // preload(): carrega fonte Monocraft + partícula
  // create(): partículas ascendentes, setUpMainMenuUI()
  // startGame(isContinue): tearDownMainMenuUI() → scene.start('introduction-scene')
  // loadGame(): tearDownMainMenuUI() → GameDataService.loadData() → startGame(true)
}
```

### 8.2 IntroductionScene

```typescript
class IntroductionScene extends Phaser.Scene {
  key = 'introduction-scene';
  blackBackground: Phaser.GameObjects.Graphics;
  textLayer: Phaser.GameObjects.Layer;
  emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  isContinue?: boolean;

  // init(data): recebe { isContinue }
  // preload(): fonte + background preto + partícula
  // create(): se !isContinue → setUpIntroductionUI(); senão → fadeOutAndDestroy()
  // fadeOutAndDestroy(): tween de alpha → scene.launch('map-scene') → scene.stop()
}
```

### 8.3 MapScene (Principal)

```typescript
class MapScene extends Phaser.Scene {
  key = 'map-scene';
  static DIALOG_OPEN_COUNT = 0;
  static HOVER_UI_ELEMENT = false;

  tileSize = 12;
  tileLayer: Array<Array<Phaser.GameObjects.Rectangle>>;
  colorFilter: Phaser.GameObjects.Graphics;
  screenGridHeightSize = 0;
  screenGridWidthSize = 0;
  gridOffsetX = 0;
  gridOffsetY = 0;
  activeCell?: Phaser.GameObjects.Rectangle;

  // preload(): spritesheet 'tiles', listener resize, initSeed
  // create(): setMapUpUI(), gridCenter(), launch sub-scenes, doColorFilter()
  // setGrid(): cria rectangles interativos com pointerover/out/up
  // drawMap(): pinta tiles com cor do biome
  // doColorFilter(): overlay azul (20h-5h) ou laranja (amanhecer/entardecer)
  // moveCamera(): atualiza offsets e redesenha
  // isUiBlocking(): DIALOG_OPEN_COUNT > 0 || HOVER_UI_ELEMENT
}
```

### 8.4 MapPlayerScene

```typescript
class MapPlayerScene extends Phaser.Scene {
  key = 'map-player-scene';
  // Representa jogador como rectangle azul (0x2222aa) centralizado
  // Dados: player.setData({ x, y, currentPositionX/Y, currentX/Y })
}
```

### 8.5 MapPathScene

```typescript
class MapPathScene extends Phaser.Scene {
  key = 'map-path-scene';
  lockPath = false;
  // doPath(x, y): calcula e desenha caminho com Graphics (linha branca)
  // followPath(x, y): executa movimento passo a passo
  //   - move câmera tile por tile
  //   - consome stamina
  //   - avança tempo
  //   - checa encontros: checkIfEncountersHappensOnTravel()
}
```

### 8.6 MapUIScene

```typescript
class MapUIScene extends Phaser.Scene {
  key = 'map-ui-scene';
  uiLayer: Phaser.GameObjects.Layer;
  // showCurrentTime(): exibe hora formatada
  // showTileInfo(x, y): exibe nome do bioma e custos
}
```

---

## 9. Diagrama de Conexões e Dependências

```
┌─────────────────────────────────────────────────────────────────────┐
│                              APP SHELL                               │
│                         AppComponent.ts                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │ MainMenu    │→ │ Introduction│→ │ MapScene    │→ │ Sub-scenes │ │
│  │   Scene     │  │   Scene     │  │  (parent)   │  │ Player/Path│ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
│         │                                                        │
│         └────────────────→ GameDataService (estado global) ←──────┘
└─────────────────────────────────────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    │                               │                               │
┌───▼──────────┐          ┌────────▼────────┐           ┌──────────▼──────┐
│  Save/Load   │          │  Map Generator  │           │  Battle System  │
│  localStorage│          │  (Procedural)   │           │                 │
│              │          │                 │           │  BattleContext  │
│  Company     │          │  MapGenerator   │           │  ├── BattleTeam │
│  Actor       │          │  MapPathUtils   │           │  ├── BattleActor│
│  Gauges      │          │  Biome data     │           │  ├── doAttack   │
│  Stats       │          │  Region names   │           │  └── XP calc    │
└──────────────┘          └─────────────────┘           └─────────────────┘

DOM/UI Layer (imperativo, fora do Angular/Phaser cycle):
┌─────────────────────────────────────────────────────────────────────┐
│  ui-elements.util.ts  →  Cria menus, botões, painéis de status      │
│  ui-notification.util.ts → Web Components: dialogs, toasts, alerts   │
│  message-handler.ts → Fila de mensagens HTML sanitizadas            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 10. Fluxos Principais

### 10.1 Fluxo de Inicialização

```
1. AppComponent.ngOnInit()
   └─→ new Phaser.Game(config) → registra 6 scenes
2. Phaser auto-inicia MainMenuScene
   └─→ create() → setUpMainMenuUI() → partículas
3. Usuário clica "Start"
   └─→ MainMenuScene.startGame(false)
       └─→ scene.start('introduction-scene', { isContinue: false })
4. IntroductionScene.create()
   └─→ setUpIntroductionUI() (criação de personagem)
   └─→ Ao final → fadeOutAndDestroy()
       └─→ scene.launch('map-scene') + scene.stop('introduction-scene')
5. MapScene.create()
   └─→ launch('map-player-scene', 'map-path-scene', 'map-ui-scene')
```

### 10.2 Fluxo de Exploração

```
1. Jogador move mouse sobre tile
   └─→ pointerover → destaca tile + MapPathScene.doPath(x,y)
2. Jogador clica tile
   └─→ pointerup → MapPathScene.followPath(x,y)
       └─→ calcula path com MapPathUtils.calculatePath()
       └─→ move câmera passo a passo
       └─→ cada passo: consome stamina, avança tempo
       └─→ checa encontros: checkIfEncountersHappensOnTravel()
           └─→ se encontro com demandsAttention → abre dialog
           └─→ se encontro com ação "Fight" → monta BattleScheme
               └─→ abre HTMLBattleDialogElement → inicia BattleContext
```

### 10.3 Fluxo de Batalha

```
1. Encounter monta BattleScheme (groups, events, introductionText)
2. HTMLBattleDialogElement cria BattleContext com panels DOM
3. battleContext.start()
   └─→ doTeams() → monta BattleTeam/BattleActor a partir de BattleGroup
   └─→ doActionList() → preenche actionSlots baseado em velocidade
   └─→ triggerEvents(BEFORE_BATTLE_START)
   └─→ unravelBattle() (loop recursivo)
       └─→ pega próximo actionSlot
       └─→ triggerEvents(TURN_START)
       └─→ triggerEvents(BEFORE_ACTION)
       └─→ Se player e !auto → chooseAction() (aguarda input)
           Senão → BATTLE_INSTRUCTIONS.GET_RANDOM_ALIVE_ADVERSARY()
       └─→ doAttack() → executa MoveExpression na Mini-VM
       └─→ triggerEvents(AFTER_ACTION)
       └─→ triggerEvents(ON_AGGRESSION)
       └─→ markFaintedActors() → aplica XP, remove slots
       └─→ triggerEvents(TURN_END)
       └─→ retreatFoelessTeams()
       └─→ doEndOrNextTurn()
           └─→ Se não há animosidade → vencedor declarado → onEndCallback()
           └─→ Se player derrotado → penalidade + retorna ao mapa
           └─→ Senão → unravelBattle() (próximo turno)
```

### 10.4 Fluxo de Save/Load

```
SAVE:
1. GameDataService.saveData()
   └─→ Company.untieCircularReference() → quebra refs circulares
   └─→ JSON.stringify(GAME_DATA)
   └─→ localStorage.setItem(STORAGE_KEY, ...)

LOAD:
1. GameDataService.loadData()
   └─→ localStorage.getItem(STORAGE_KEY)
   └─→ JSON.parse()
   └─→ Company.instantiate() → reconstrói objetos Actor
```

---

## 11. Configurações de Projeto

### 11.1 package.json (Dependências Principais)

```json
{
  "dependencies": {
    "@angular/*": "^19.2.0",
    "phaser": "^3.70.0",
    "primeng": "^19.0.9",
    "primeflex": "^3.3.1",
    "jquery": "^3.7.1",
    "rxjs": "~7.8.0",
    "simplex-noise": "^3.x",
    "seedrandom": "^3.x",
    "alea": "^1.x",
    "events": "^3.x"
  },
  "devDependencies": {
    "@angular/cli": "^19.2.0",
    "typescript": "~5.5.4",
    "karma": "^6.x",
    "jasmine-core": "^5.x"
  }
}
```

### 11.2 tsconfig.json (Flags Importantes)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "strict": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "typeRoots": ["./node_modules/@types", "./node_modules/phaser/types"],
    "types": ["Phaser", "jquery"]
  },
  "angularCompilerOptions": {
    "strictTemplates": true,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true
  }
}
```

### 11.3 angular.json

```json
{
  "projects": {
    "wonder-quest": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "outputPath": "dist/wonder-quest",
            "index": "src/index.html",
            "browser": "src/main.ts",
            "polyfills": ["src/polyfills.ts"],
            "assets": ["src/favicon.ico", "src/assets"],
            "styles": ["src/styles.scss"]
          }
        }
      }
    }
  }
}
```

---

## 12. Assets Necessários

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `assets/tiles.png` | Spritesheet 32×256 | Tileset (8 tiles de 32×32) — preparado para uso futuro |
| `assets/tiles.xcf` | GIMP source | Edição do tileset |
| `assets/particula.png` | Sprite 7×7 | Partícula para efeitos visuais |
| `assets/cursor.png` | Sprite 32×32 | Cursor customizado |
| `assets/Monocraft-nerd-fonts-patched.ttf` | Fonte | Monoespaçada estilo pixel/terminal |
| `assets/fonts/caviar_dreams/*.ttf` | Fonte | 4 variações (normal, bold, italic, bold-italic) |
| `assets/fonts/rpgawesome-webfont.*` | Fonte de ícones | Ícones temáticos RPG |
| `assets/rpg-awesome/rpg-awesome.min.css` | CSS | Folha de estilos para ícones |
| `assets/img/bg/placeholder.png` | Imagem 960×448 | Background placeholder |

> **Nota:** O projeto atual **não usa áudio**. O tileset é carregado mas não utilizado (mapa usa retângulos coloridos).

---

## 13. Padrões de Design Resumidos

| Padrão | Implementação |
|--------|--------------|
| **Registry / Singleton por tipo** | `Context.ACTIVE_CONTEXTS` |
| **State Machine** | `BATTLE_EVENT_TYPE` com gatilhos |
| **Strategy** | `BattleInstruction` — IA plugável |
| **Command / Mini-VM** | `MoveBehaviour` interpretado por `doAttack` |
| **Data-Driven / DSL** | `MoveExpression` — ataques como dados |
| **Factory / Builder** | `HERO_BUILDER`, `SLIME_BUILDER`, `BattleContext.build()` |
| **Template Method** | `HTMLCustomDialogElement` com subclasses |
| **Web Components** | Diálogos customizados (`customElements.define`) |
| **Utility Class** | `CalcUtil`, `StatCalc`, `GaugeCalc` (estáticos) |
| **Producer-Consumer** | `MessageHandler` — fila de mensagens |

---

## 14. Checklist para Novo Agente

- [ ] Criar projeto Angular v19 com strict mode
- [ ] Instalar Phaser 3, PrimeNG, PrimeFlex, simplex-noise, seedrandom
- [ ] Configurar `tsconfig.json` com types Phaser e jQuery
- [ ] Criar estrutura de pastas conforme seção 2
- [ ] Implementar models: Stat, Gauge, Actor, Company, Move, Biome
- [ ] Implementar core: Context, BattleContext, XP calc, MessageHandler
- [ ] Implementar data/bank: biomas, encontros (começar com PLAINS), nomes
- [ ] Implementar data/builder: hero-builder, slime-builder, stats-setter, gauge-setter
- [ ] Implementar utils: map-generator (fBm + Simplex), map-path, calc, color
- [ ] Implementar service: GameDataService com save/load localStorage
- [ ] Implementar scenes: MainMenu, Introduction, Map + sub-scenes
- [ ] Implementar UI DOM: menus, diálogos, painel de status, batalha
- [ ] Configurar AppComponent para inicializar Phaser com as 6 scenes
- [ ] Adicionar assets: tileset, partículas, fontes
- [ ] Testar fluxo: Menu → Intro → Mapa → Clique → Path → Encontro → Batalha

---

*Fim do Blueprint. Este documento contém todos os schemas, estruturas e conexões necessários para replicar ou expandir a arquitetura do WonderQuest.*
