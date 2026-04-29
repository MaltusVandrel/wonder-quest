/**
 * Parser seguro de expressões matemáticas para o sistema de batalha.
 * Substitui o construtor `Function()` perigoso por uma implementação
 * baseada em tokenização, algoritmo Shunting-yard e avaliação em RPN.
 */

// ============================================================================
// Erros Tipados
// ============================================================================

export class ExpressionParserError extends Error {
  readonly expression: string;
  readonly position?: number;

  constructor(message: string, expression: string, position?: number) {
    super(message);
    this.name = 'ExpressionParserError';
    this.expression = expression;
    this.position = position;
  }
}

export class ExpressionSyntaxError extends ExpressionParserError {
  constructor(message: string, expression: string, position?: number) {
    super(`Erro de sintaxe: ${message}`, expression, position);
    this.name = 'ExpressionSyntaxError';
  }
}

export class ExpressionVariableError extends ExpressionParserError {
  constructor(message: string, expression: string, position?: number) {
    super(`Erro de variável: ${message}`, expression, position);
    this.name = 'ExpressionVariableError';
  }
}

export class ExpressionRuntimeError extends ExpressionParserError {
  constructor(message: string, expression: string, position?: number) {
    super(`Erro em tempo de execução: ${message}`, expression, position);
    this.name = 'ExpressionRuntimeError';
  }
}

// ============================================================================
// Tipos de Token
// ============================================================================

type TokenType =
  | 'NUMBER'
  | 'BOOLEAN'
  | 'VARIABLE'
  | 'OPERATOR'
  | 'LPAREN'
  | 'RPAREN'
  | 'FUNCTION'
  | 'COMMA'
  | 'EOF';

interface Token {
  type: TokenType;
  value: string;
  position: number;
}

// ============================================================================
// Precedência e Associatividade de Operadores
// ============================================================================

interface OperatorInfo {
  precedence: number;
  associativity: 'left' | 'right';
  arity: number;
}

const OPERATORS: Record<string, OperatorInfo> = {
  '||': { precedence: 1, associativity: 'left', arity: 2 },
  '&&': { precedence: 2, associativity: 'left', arity: 2 },
  '==': { precedence: 3, associativity: 'left', arity: 2 },
  '!=': { precedence: 3, associativity: 'left', arity: 2 },
  '>': { precedence: 4, associativity: 'left', arity: 2 },
  '<': { precedence: 4, associativity: 'left', arity: 2 },
  '>=': { precedence: 4, associativity: 'left', arity: 2 },
  '<=': { precedence: 4, associativity: 'left', arity: 2 },
  '+': { precedence: 5, associativity: 'left', arity: 2 },
  '-': { precedence: 5, associativity: 'left', arity: 2 },
  '*': { precedence: 6, associativity: 'left', arity: 2 },
  '/': { precedence: 6, associativity: 'left', arity: 2 },
  '%': { precedence: 6, associativity: 'left', arity: 2 },
  '**': { precedence: 7, associativity: 'right', arity: 2 },
};

const UNARY_MINUS = 'unary-minus';

// ============================================================================
// Tokenizador (Lexer)
// ============================================================================

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < expression.length) {
    const char = expression[i];

    // Ignora espaços em branco
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Números (inteiros e floats)
    if (/\d/.test(char) || (char === '.' && /\d/.test(expression[i + 1] || ''))) {
      const start = i;
      let hasDot = false;

      while (i < expression.length && (/\d/.test(expression[i]) || expression[i] === '.')) {
        if (expression[i] === '.') {
          if (hasDot) {
            throw new ExpressionSyntaxError('Número com múltiplos pontos decimais', expression, i);
          }
          hasDot = true;
        }
        i++;
      }

      tokens.push({
        type: 'NUMBER',
        value: expression.slice(start, i),
        position: start,
      });
      continue;
    }

    // Variáveis: $path.to.value
    if (char === '$') {
      const start = i;
      i++;

      if (i >= expression.length || !/[a-zA-Z_]/.test(expression[i])) {
        throw new ExpressionSyntaxError('Esperado identificador após "$"', expression, i);
      }

      while (i < expression.length && /[a-zA-Z0-9_.]/.test(expression[i])) {
        i++;
      }

      tokens.push({
        type: 'VARIABLE',
        value: expression.slice(start, i),
        position: start,
      });
      continue;
    }

    // Booleanos literais e funções
    if (/[a-zA-Z]/.test(char)) {
      const start = i;
      while (i < expression.length && /[a-zA-Z0-9_.]/.test(expression[i])) {
        i++;
      }

      const word = expression.slice(start, i);

      // Booleanos literais
      if (word === 'true' || word === 'false') {
        tokens.push({
          type: 'BOOLEAN',
          value: word,
          position: start,
        });
        continue;
      }

      // Verifica se é uma chamada de função válida
      if (word === 'Math.random') {
        tokens.push({
          type: 'FUNCTION',
          value: word,
          position: start,
        });
      } else {
        throw new ExpressionSyntaxError(`Identificador desconhecido: "${word}"`, expression, start);
      }
      continue;
    }

    // Operadores de dois caracteres
    const twoChar = expression.slice(i, i + 2);
    if (OPERATORS[twoChar]) {
      tokens.push({
        type: 'OPERATOR',
        value: twoChar,
        position: i,
      });
      i += 2;
      continue;
    }

    // Operadores de um caractere
    if (OPERATORS[char]) {
      tokens.push({
        type: 'OPERATOR',
        value: char,
        position: i,
      });
      i++;
      continue;
    }

    // Parênteses
    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(', position: i });
      i++;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')', position: i });
      i++;
      continue;
    }

    // Vírgula (para futuras funções com argumentos)
    if (char === ',') {
      tokens.push({ type: 'COMMA', value: ',', position: i });
      i++;
      continue;
    }

    throw new ExpressionSyntaxError(`Caractere inesperado: "${char}"`, expression, i);
  }

  tokens.push({ type: 'EOF', value: '', position: expression.length });
  return tokens;
}

// ============================================================================
// Resolução de Variáveis
// ============================================================================

function resolveVariable(variablePath: string, context: Record<string, unknown>): unknown {
  // Remove o prefixo '$'
  const path = variablePath.slice(1);
  const parts = path.split('.');

  let current: unknown = context;

  for (const part of parts) {
    if (current === null || current === undefined) {
      throw new ExpressionVariableError(
        `Caminho inválido: "${variablePath}" — valor nulo ou indefinido em "${part}"`,
        variablePath
      );
    }

    if (typeof current !== 'object') {
      throw new ExpressionVariableError(
        `Caminho inválido: "${variablePath}" — "${part}" não é um objeto`,
        variablePath
      );
    }

    current = (current as Record<string, unknown>)[part];
  }

  if (current === undefined) {
    throw new ExpressionVariableError(`Variável não encontrada: "${variablePath}"`, variablePath);
  }

  return current;
}

// ============================================================================
// Conversão Infixo → RPN (Algoritmo Shunting-yard)
// ============================================================================

type RPNToken =
  | { type: 'number'; value: number }
  | { type: 'boolean'; value: boolean }
  | { type: 'variable'; value: string }
  | { type: 'operator'; value: string; arity: number }
  | { type: 'function'; value: string };

function toRPN(tokens: Token[], expression: string): RPNToken[] {
  const output: RPNToken[] = [];
  const operatorStack: Token[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const prevToken = i > 0 ? tokens[i - 1] : null;

    switch (token.type) {
      case 'NUMBER': {
        const num = parseFloat(token.value);
        if (isNaN(num)) {
          throw new ExpressionSyntaxError(
            `Número inválido: "${token.value}"`,
            expression,
            token.position
          );
        }
        output.push({ type: 'number', value: num });
        break;
      }

      case 'BOOLEAN': {
        output.push({ type: 'boolean', value: token.value === 'true' });
        break;
      }

      case 'VARIABLE': {
        output.push({ type: 'variable', value: token.value });
        break;
      }

      case 'FUNCTION': {
        operatorStack.push(token);
        break;
      }

      case 'OPERATOR': {
        // Detecta menos unário
        let op = token.value;
        if (
          op === '-' &&
          (!prevToken ||
            prevToken.type === 'OPERATOR' ||
            prevToken.type === 'LPAREN' ||
            prevToken.type === 'COMMA')
        ) {
          op = UNARY_MINUS;
        }

        const opInfo =
          op === UNARY_MINUS
            ? { precedence: 8, associativity: 'right' as const, arity: 1 }
            : OPERATORS[op];

        while (operatorStack.length > 0) {
          const top = operatorStack[operatorStack.length - 1];
          if (top.type !== 'OPERATOR' && top.type !== 'FUNCTION') break;

          const topOp = top.value;
          const topInfo =
            topOp === UNARY_MINUS
              ? { precedence: 8, associativity: 'right' as const, arity: 1 }
              : OPERATORS[topOp];

          if (!topInfo) break;

          const shouldPop =
            opInfo.associativity === 'left'
              ? topInfo.precedence >= opInfo.precedence
              : topInfo.precedence > opInfo.precedence;

          if (!shouldPop) break;

          operatorStack.pop();
          output.push({
            type: 'operator',
            value: topOp,
            arity: topInfo.arity,
          });
        }

        operatorStack.push({ ...token, value: op });
        break;
      }

      case 'LPAREN': {
        operatorStack.push(token);
        break;
      }

      case 'RPAREN': {
        let foundLParen = false;
        while (operatorStack.length > 0) {
          const top = operatorStack.pop()!;
          if (top.type === 'LPAREN') {
            foundLParen = true;
            break;
          }
          const topInfo =
            top.value === UNARY_MINUS
              ? { precedence: 8, associativity: 'right' as const, arity: 1 }
              : OPERATORS[top.value];
          output.push({
            type: 'operator',
            value: top.value,
            arity: topInfo?.arity ?? 2,
          });
        }

        if (!foundLParen) {
          throw new ExpressionSyntaxError(
            'Parêntese de fechamento sem parêntese de abertura correspondente',
            expression,
            token.position
          );
        }

        // Se o token no topo for uma função, pop para a saída
        if (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1].type === 'FUNCTION'
        ) {
          const func = operatorStack.pop()!;
          output.push({ type: 'function', value: func.value });
        }
        break;
      }

      case 'COMMA': {
        while (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1].type !== 'LPAREN'
        ) {
          const top = operatorStack.pop()!;
          const topInfo =
            top.value === UNARY_MINUS
              ? { precedence: 8, associativity: 'right' as const, arity: 1 }
              : OPERATORS[top.value];
          output.push({
            type: 'operator',
            value: top.value,
            arity: topInfo?.arity ?? 2,
          });
        }
        break;
      }

      case 'EOF':
        break;
    }
  }

  // Esvazia a pilha de operadores
  while (operatorStack.length > 0) {
    const top = operatorStack.pop()!;
    if (top.type === 'LPAREN' || top.type === 'RPAREN') {
      throw new ExpressionSyntaxError(
        'Parêntese de abertura sem fechamento correspondente',
        expression,
        top.position
      );
    }
    const topInfo =
      top.value === UNARY_MINUS
        ? { precedence: 8, associativity: 'right' as const, arity: 1 }
        : OPERATORS[top.value];
    output.push({
      type: 'operator',
      value: top.value,
      arity: topInfo?.arity ?? 2,
    });
  }

  return output;
}

// ============================================================================
// Avaliação de RPN
// ============================================================================

function evaluateRPN(
  rpn: RPNToken[],
  expression: string,
  context: Record<string, unknown>
): number | boolean {
  const stack: (number | boolean)[] = [];

  for (const token of rpn) {
    switch (token.type) {
      case 'number': {
        stack.push(token.value);
        break;
      }

      case 'boolean': {
        stack.push(token.value);
        break;
      }

      case 'variable': {
        const resolved = resolveVariable(token.value, context);

        if (typeof resolved === 'number') {
          stack.push(resolved);
        } else if (typeof resolved === 'boolean') {
          stack.push(resolved);
        } else if (typeof resolved === 'string') {
          const parsed = parseFloat(resolved);
          if (isNaN(parsed)) {
            throw new ExpressionRuntimeError(
              `Variável "${token.value}" não é um número ou booleano válido`,
              expression
            );
          }
          stack.push(parsed);
        } else {
          throw new ExpressionRuntimeError(
            `Variável "${token.value}" resolvida para tipo inválido: ${typeof resolved}`,
            expression
          );
        }
        break;
      }

      case 'function': {
        if (token.value === 'Math.random') {
          stack.push(Math.random());
        } else {
          throw new ExpressionRuntimeError(`Função não implementada: "${token.value}"`, expression);
        }
        break;
      }

      case 'operator': {
        if (token.arity === 1) {
          // Operador unário
          if (stack.length < 1) {
            throw new ExpressionRuntimeError(
              `Operador "${token.value}" requer 1 operando`,
              expression
            );
          }
          const a = stack.pop()!;

          if (token.value === UNARY_MINUS) {
            if (typeof a !== 'number') {
              throw new ExpressionRuntimeError('Operador unário "-" requer um número', expression);
            }
            stack.push(-a);
          } else {
            throw new ExpressionRuntimeError(
              `Operador unário desconhecido: "${token.value}"`,
              expression
            );
          }
        } else {
          // Operador binário
          if (stack.length < 2) {
            throw new ExpressionRuntimeError(
              `Operador "${token.value}" requer 2 operandos`,
              expression
            );
          }
          const b = stack.pop()!;
          const a = stack.pop()!;

          const result = applyBinaryOperator(token.value, a, b, expression);
          stack.push(result);
        }
        break;
      }
    }
  }

  if (stack.length !== 1) {
    throw new ExpressionRuntimeError(
      'Expressão inválida: pilha final com múltiplos valores',
      expression
    );
  }

  const finalResult = stack[0];

  if (typeof finalResult !== 'number' && typeof finalResult !== 'boolean') {
    throw new ExpressionRuntimeError(`Resultado inválido: ${typeof finalResult}`, expression);
  }

  return finalResult;
}

function applyBinaryOperator(
  op: string,
  a: number | boolean,
  b: number | boolean,
  expression: string
): number | boolean {
  // Operadores aritméticos exigem números
  const arithmeticOps = ['+', '-', '*', '/', '%', '**'];
  const comparisonOps = ['>', '<', '>=', '<='];
  const equalityOps = ['==', '!='];
  const logicalOps = ['&&', '||'];

  if (arithmeticOps.includes(op) || comparisonOps.includes(op)) {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new ExpressionRuntimeError(`Operador "${op}" requer operandos numéricos`, expression);
    }
  }

  if (equalityOps.includes(op)) {
    if (typeof a === 'number' && typeof b === 'number') {
      return op === '==' ? a === b : a !== b;
    }
    if (typeof a === 'boolean' && typeof b === 'boolean') {
      return op === '==' ? a === b : a !== b;
    }
    throw new ExpressionRuntimeError(`Operador "${op}" requer operandos do mesmo tipo`, expression);
  }

  if (logicalOps.includes(op)) {
    if (typeof a !== 'boolean' || typeof b !== 'boolean') {
      throw new ExpressionRuntimeError(`Operador "${op}" requer operandos booleanos`, expression);
    }
    return op === '&&' ? a && b : a || b;
  }

  // A partir daqui, a e b são garantidamente números
  const left = a as number;
  const right = b as number;

  switch (op) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      if (right === 0) {
        throw new ExpressionRuntimeError('Divisão por zero', expression);
      }
      return left / right;
    case '%':
      if (right === 0) {
        throw new ExpressionRuntimeError('Módulo por zero', expression);
      }
      return left % right;
    case '**':
      return left ** right;
    case '>':
      return left > right;
    case '<':
      return left < right;
    case '>=':
      return left >= right;
    case '<=':
      return left <= right;
    default:
      throw new ExpressionRuntimeError(`Operador desconhecido: "${op}"`, expression);
  }
}

// ============================================================================
// Função Pública
// ============================================================================

/**
 * Avalia uma expressão matemática de forma segura, sem uso de `eval()`
 * ou `Function()`.
 *
 * @param expression - Expressão a ser avaliada (ex: `$source.stats.STRENGTH.value * 2`)
 * @param context - Objeto de contexto para resolução de variáveis `$path`
 * @returns Resultado numérico ou booleano da expressão
 * @throws {ExpressionParserError} Em caso de erro de sintaxe, variável ou execução
 */
export function evaluateExpression(
  expression: string,
  context: Record<string, unknown>
): number | boolean {
  if (!expression || expression.trim().length === 0) {
    throw new ExpressionSyntaxError('Expressão vazia', expression);
  }

  const tokens = tokenize(expression);
  const rpn = toRPN(tokens, expression);
  return evaluateRPN(rpn, expression, context);
}
