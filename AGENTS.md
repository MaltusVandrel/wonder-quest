# AGENTS.md — Insatia

> Este documento contém instruções, convenções e contexto essencial para agentes de código que trabalharão no projeto **Wonder Quest**.

---

## 1. Identidade do Projeto

- **Nome**: Insatia
- **Gênero**: JRPG com minigames, navegação por mapa e sistemas procedurais
- **Aparência**: Retro medieval (paleta escura, acentos dourados, fontes serifadas)
- **Stack**: Vite + React + TypeScript + Redux Toolkit + i18n + Phaser + SCSS
- **Arquitetura UI**: Atomic Design
- **Game Engine**: Phaser (framework 2D completo com physics, scenes, audio, input)

---

## 2. Diretrizes Comportamentais e Gerais

- **Não fantasie**: Jamais invente informações (alucinações). Baseie-se no código existente. Pergunte ao usuário se tiver dúvidas.
- **Idioma de Resposta**: As respostas devem ser produzidas sempre em **português do Brasil**.
- **Documentação e Comentários**: Todos os comentários no código e documentações técnicas geradas devem ser em **português do Brasil**.
- **Autorização para Commits**: Nunca execute `git commit`, `git push`, `git reset`, `git rebase` ou qualquer outra mutação no repositório.
- **Design Visual Retro Medieval**: Sempre que criar ou modificar elementos visuais, mantenha a estética retro medieval — paleta escura com acentos dourados (#c9a227), fontes serifadas (Cinzel, Lora), bordas ornamentadas, sombras suaves.

---

## 3. Convenções de Código

- **Linguagem**: TypeScript estrito. `strict: true` está ativo. Evite `any` a todo custo.
- **Formatação**: Prettier configurado. Execute `npm run format` antes de finalizar tarefas.
- **Linting**: ESLint com `@typescript-eslint/no-explicit-any: error`.
- **Estilos**: SCSS com padrão nested + BEM. Tokens definidos em `src/styles/_variables.scss`.

### SCSS Nesteado (Nested SCSS)

Todas as estilizações escritas em SCSS devem seguir o padrão **nesteado** (nested). Evite seletores planos e repetidos.

**✅ Correto:**

```scss
.hud-panel {
  padding: 16px;
  background: $color-bg-panel;
  border: 1px solid $color-border;

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;

    &__title {
      font-family: $font-serif;
      font-size: 1.25rem;

      &:hover {
        color: $color-text-gold;
      }
    }
  }
}
```

**❌ Incorreto:**

```scss
.hud-panel {
  padding: 16px;
}
.hud-panel__header {
  display: flex;
}
.hud-panel__header__title {
  font-size: 1.25rem;
}
```

Regras:

- Aninhe seletores filhos dentro do bloco do pai.
- Use `&` para pseudo-classes, pseudo-elementos e modificadores BEM (`&__elemento`, `&--modificador`).
- Limite o aninhamento a **no máximo 4 níveis**.
- Nunca aninhe IDs dentro de outros seletores.
- Prefira nomear classes com padrão **BEM**.

### Componentes React

- Componentes funcionais com `React.FC`.
- Props devem ter interfaces nomeadas (ex: `interface ButtonProps`).
- Nunca acumule lógica pesada diretamente no corpo de componentes visuais — extraia para hooks customizados.
- Use `React.memo` para componentes que recebem props estáveis e são re-renderizados frequentemente.

---

## 4. Arquitetura e Padrões

### Separação React UI ↔ Phaser Game Engine

Esta é a regra arquitetural mais importante do projeto:

| Camada          | Responsabilidade                               | Tecnologia           |
| --------------- | ---------------------------------------------- | -------------------- |
| **UI**          | Menus, HUD, inventário, editor, settings       | React + Redux + i18n |
| **Game Engine** | Renderização, physics, input, cenas, entidades | Phaser               |

- **React gerencia**: menus, overlays, painéis de configuração, editor de mundo, inventário, diálogos complexos.
- **Phaser gerencia**: cenas de jogo (Overworld, Battle, Minigame), sprites, tilemaps, câmera, physics, animações.
- **Comunicação**: Redux store é a fonte da verdade compartilhada. React lê/escrita slices. Phaser lê/escrita slices via eventos ou acesso direto ao store (use com cautela).

### Atomic Design

Sempre classifique novos componentes corretamente:

- **Atom**: menor unidade (botão medieval, ícone, input retro, barra de progresso)
- **Molecule**: combinação de átomos (slot de item, linha de diálogo, controle de volume)
- **Organism**: seção complexa (inventário completo, painel de stats, minimapa, GameCanvas)
- **Template**: layout de página sem dados (layout de jogo com HUD, layout de editor)
- **Page**: tela montada (tela de jogo, tela de editor, menu principal)

### Redux Toolkit

Localização: `src/store/slices/`

Regras:

- Crie um slice por domínio.
- Prefira `createSlice` com reducers síncronos.
- Thunks e RTK Query podem ser usados futuramente.
- Hooks tipados obrigatórios: `useAppDispatch` e `useAppSelector`.

Slices existentes:

- `gameSlice` — cena atual, pausa, modo editor, save slot
- `worldSlice` — seed, bioma, hora do dia, clima, regiões descobertas
- `playerSlice` — nome, stats, inventário, posição, região atual
- `editorSlice` — modo editor, ferramenta ativa, camada, histórico de undo/redo
- `settingsSlice` — idioma, volumes, fullscreen, FPS counter

### Internacionalização (i18n)

Localização: `src/i18n/`

Regras:

- **É estritamente proibido usar textos estáticos ("hardcoded") em interfaces gráficas.**
- O uso do sistema de chaves e variáveis para internacionalização é **obrigatório**: `t('menu.title')` ou `t('game.inventory', { count })`.
- Chaves em kebab-case aninhadas: `menu.title`, `editor.tools.paint`
- Nunca concatene strings traduzidas. Use interpolação.
- Novos idiomas DEVEM ser adicionados em `supportedLanguages` e nos metadados de UI.
- Idiomas ativos: `pt-BR` (padrão), `en`.

### Design System / Cores

- **Nenhuma cor deve ser fixa nativamente** (ex: `color: 'red'`, `backgroundColor: '#fff'`).
- Utilize **sempre** tokens do Design System definidos em `src/styles/_variables.scss`.
- Cores principais: fundo escuro `#0a0a0f`, painel `#1a1a2e`, acento dourado `#c9a227`, texto `#e8e8e8`.
- Fontes: `Cinzel` para títulos e botões, `Lora` para corpo de texto.

---

## 5. Phaser — Convenções de Game Engine

### Estrutura de Cenas

Padrão de fluxo de cenas:

```
BootScene → PreloadScene → MenuScene → OverworldScene
                                      ↓
                               BattleScene / MinigameScene
                                      ↓
                                    (retorna)
```

- `BootScene`: Inicialização mínima, cria texturas placeholder se necessário.
- `PreloadScene`: Carrega todos os assets com barra de progresso.
- `MenuScene`: Menu principal com opções de novo jogo, continuar, editor.
- `OverworldScene`: Mapa navegável, POIs, paths, player movement.
- `BattleScene` (futuro): Combate por minigame.
- `MinigameScene` (futuro): Execução de ações via minigames.

### Regras de Cenas

- Use `Scene` do Phaser como base. Não use funções antigas de `Phaser.Scene`.
- Registre todas as cenas no `GameCanvas.tsx`.
- Transições de cena devem ser feitas via `this.scene.start('SceneName', data)`.
- Dados entre cenas: use o segundo parâmetro de `start()` e `init(data)`.

### Assets

- Assets em `public/assets/` (servidos estáticamente).
- Subdiretórios: `sprites/`, `tilesets/`, `audio/`, `fonts/`.
- Use texture atlas para sprites de personagens (performance).
- Audio: prefira `.ogg` + `.mp3` para compatibilidade.

### Physics

- Physics padrão: `arcade` (top-down 2D).
- Gravity em `{ x: 0, y: 0 }` para movimento livre.
- Use `setCollideWorldBounds(true)` para manter entidades no mapa.

### Performance no Phaser

- Object pooling para inimigos e projéteis frequentes.
- Camera culling: Phaser faz automaticamente, mas evite criar milhares de objetos.
- Use `tilemap` para terrenos grandes, não sprites individuais.

---

## 6. Sistemas Procedurais

### Geração de Biomas

- Algoritmo baseado em noise (Simplex/Perlin) com seed fixa para reprodutibilidade.
- Cada bioma tem: tileset, paleta de cores, tabela de spawn, modificadores.
- Seed armazenada em `worldSlice.seed`.

### Spawn de Inimigos

- Tabelas de spawn por bioma + nível do jogador.
- Modificadores (affixes) aplicados proceduralmente: `Forte`, `Veloz`, `Envenenado`, etc.
- Dificuldade escalada por distância do spawn inicial.

### Modificadores

- Sistema de attributes/affixes aplicável a inimigos, itens e POIs.
- Estrutura: `{ id, name, type, value, rarity }`.
- Combináveis (ex: `Espada + Flamejante + do Caçador`).

---

## 7. Editor de Mundo

### Funcionalidades

- Ativado via toggle no menu ou tecla de atalho (`E` no Overworld).
- UI do editor em React (sidebar, painel de propriedades, toolbar).
- Modo editor no Phaser: grid visível, snap, seleção, drag-and-drop.

### Ferramentas

- **Select**: Seleciona entidades/POIs para editar propriedades.
- **Move**: Reposiciona elementos.
- **Paint**: Pinta tiles de terreno.
- **Erase**: Remove tiles/objetos.
- **Entity**: Coloca novas entidades (NPCs, inimigos, POIs).
- **Path**: Desenha caminhos entre regiões.

### Camadas

1. Terrain — chão, biomas
2. Objects — árvores, rochas, construções
3. Entities — NPCs, inimigos, itens no chão
4. Paths — rotas de navegação

### Persistência

- Exporta configuração de mundo para JSON.
- Importa JSON para carregar mundos customizados.
- Estrutura: `{ seed, biomes, entities, pois, paths, metadata }`.

---

## 8. Performance e Escalabilidade

- **Lazy loading**: Carregue assets de bioma sob demanda.
- **Web Workers**: Use para geração procedural pesada (noise, pathfinding).
- **Virtualização**: Em listas grandes (inventário, lista de saves), use `react-window`.
- **Memoização**: `React.memo`, `useMemo`, `useCallback` onde apropriado.
- **Phaser object pooling**: Reutilize sprites em vez de criar/destruir.

---

## 9. Segurança e Qualidade

- Mantenha `strictNullChecks` e `noImplicitAny` ativos.
- Valide dados vindos de localStorage/saves antes de carregar.
- Nunca exponha dados sensíveis em logs.
- Siga as regras do ESLint configurado.

---

## 10. Alias de Importação

```ts
import { algo } from '@/components/atoms/Algo'; // src/components/atoms/Algo
import { store } from '@/store'; // src/store
import type { AppConfig } from '@/types'; // src/types
```

O alias `@/` está configurado no `vite.config.ts` e `tsconfig.app.json`.

---

## 11. Skills do Projeto

O diretório `skills/` contém skills especializadas instaladas a partir do repositório `antigravity-awesome-skills`. Elas cobrem áreas como desenvolvimento de jogos, design UI/UX, animação, performance, segurança e muito mais.

### Regras Obrigatórias sobre Skills

1. **Sempre manter a lista de skills atualizada** — ao instalar, remover ou renomear qualquer skill, atualize este documento.
2. **Antes de executar qualquer tarefa, verifique se existe uma skill aplicável** — leia os nomes das skills em `skills/` e determine se alguma cobre o domínio da tarefa.
3. **Se uma skill for necessária, carregue-a na memória** — leia o arquivo `skills/<nome>/SKILL.md` completo antes de começar a implementar.
4. **Nunca ignore uma skill relevante** — elas contêm padrões de indústria, anti-patterns e decisões arquiteturais.
5. **Ao adicionar novas skills no futuro** — siga o mesmo formato e adicione à lista abaixo.

### Skills Instaladas

| Categoria             | Skills                                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Base / Qualidade**  | `clean-code`, `debugging-strategies`                                                                           |
| **Game Dev**          | `game-development`, `game-design`, `game-art`, `game-audio`, `2d-games`, `web-games`, `pc-games`               |
| **Canvas / Render**   | `canvas-design`                                                                                                |
| **Frontend / React**  | `react-best-practices`, `react-patterns`, `react-state-management`, `frontend-design`                          |
| **TypeScript**        | `typescript-expert`                                                                                            |
| **i18n**              | `i18n-localization`                                                                                            |
| **Arte / UI / UX**    | `design-taste-frontend`                                                                                        |
| **Animação / Motion** | `animejs-animation`, `fixing-motion-performance`                                                               |
| **Performance**       | `performance-engineer`, `performance-optimizer`, `web-performance-optimization`, `react-component-performance` |

---

## 12. Checklist para Novas Funcionalidades

1. Componente no nível atômico correto (Atom → Molecule → Organism).
2. **Traduções adicionadas em todos os idiomas ativos** (sem textos hardcoded).
3. Se afetar estado global, avalie se precisa de novo slice ou reducer.
4. Se afetar tema/visual, teste consistência com tokens de `variables.scss`.
5. Se afetar Phaser, registre cena em `GameCanvas.tsx` e teste ciclo de vida.
6. Execute `npm run format`.
7. Execute `npm run lint`.
8. Teste `npm run dev` para verificar build.
9. Atualize `AGENTS.md` se adicionar skills ou mudar convenções.

---

## 13. Comandos Rápidos

```bash
npm run dev       # servidor de desenvolvimento Vite
npm run build     # build de produção
npm run preview   # preview do build
npm run lint      # ESLint
npm run format    # Prettier
```
