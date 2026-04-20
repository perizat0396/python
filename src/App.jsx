import { useState, useEffect, useRef } from "react";

const LABS = [
  {
    id: 1,
    title: "Переменные и типы данных",
    description: "Познакомьтесь с основными типами данных в Python: числа, строки, булевы значения.",
    tasks: [
      {
        id: "1a",
        text: "Создайте переменную name со своим именем и выведите её.",
        hint: 'name = "Иван"\nprint(name)',
        check: (output) => output.trim().length > 0,
        checkDesc: "Должен быть любой вывод",
      },
      {
        id: "1b",
        text: "Создайте две переменные a=10 и b=3, выведите их сумму, разность, произведение и частное.",
        hint: "a = 10\nb = 3\nprint(a + b)\nprint(a - b)\nprint(a * b)\nprint(a / b)",
        check: (output) => output.includes("13") && output.includes("7") && output.includes("30"),
        checkDesc: "Должны быть числа 13, 7, 30",
      },
    ],
  },
  {
    id: 2,
    title: "Условные операторы",
    description: "Научитесь использовать if/elif/else для принятия решений в программе.",
    tasks: [
      {
        id: "2a",
        text: "Напишите программу: задайте число x=15. Если x > 10 — выведите 'Большое', иначе 'Маленькое'.",
        hint: "x = 15\nif x > 10:\n    print('Большое')\nelse:\n    print('Маленькое')",
        check: (output) => output.includes("Большое"),
        checkDesc: "Должно вывестись 'Большое'",
      },
      {
        id: "2b",
        text: "Напишите программу определения оценки: score=85. A(90+), B(75-89), C(60-74), F(ниже 60).",
        hint: "score = 85\nif score >= 90:\n    print('A')\nelif score >= 75:\n    print('B')\nelif score >= 60:\n    print('C')\nelse:\n    print('F')",
        check: (output) => output.trim().includes("B"),
        checkDesc: "Должна вывестись оценка 'B'",
      },
    ],
  },
  {
    id: 3,
    title: "Циклы",
    description: "Изучите циклы for и while для повторения действий.",
    tasks: [
      {
        id: "3a",
        text: "Используя цикл for, выведите числа от 1 до 10.",
        hint: "for i in range(1, 11):\n    print(i)",
        check: (output) => output.includes("1") && output.includes("10"),
        checkDesc: "Должны быть числа от 1 до 10",
      },
      {
        id: "3b",
        text: "Выведите таблицу умножения числа 7 (от 7×1 до 7×10).",
        hint: "for i in range(1, 11):\n    print(f'7 × {i} = {7*i}')",
        check: (output) => output.includes("49") && output.includes("70"),
        checkDesc: "Должны быть числа 49 и 70",
      },
    ],
  },
  {
    id: 4,
    title: "Функции",
    description: "Создавайте и вызывайте функции для структурирования кода.",
    tasks: [
      {
        id: "4a",
        text: "Напишите функцию greet(name), которая возвращает строку 'Привет, {name}!'. Вызовите с именем 'Мир'.",
        hint: "def greet(name):\n    return f'Привет, {name}!'\n\nprint(greet('Мир'))",
        check: (output) => output.includes("Привет") && output.includes("Мир"),
        checkDesc: "Должно вывестись 'Привет, Мир!'",
      },
      {
        id: "4b",
        text: "Напишите функцию factorial(n), вычисляющую факториал числа. Проверьте: factorial(5) = 120.",
        hint: "def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(5))",
        check: (output) => output.includes("120"),
        checkDesc: "Должно вывестись 120",
      },
    ],
  },
  {
    id: 5,
    title: "Списки и словари",
    description: "Работа со структурами данных: списки и словари.",
    tasks: [
      {
        id: "5a",
        text: "Создайте список fruits с 5 фруктами. Выведите список, его длину и первый элемент.",
        hint: "fruits = ['яблоко', 'банан', 'вишня', 'манго', 'груша']\nprint(fruits)\nprint(len(fruits))\nprint(fruits[0])",
        check: (output) => output.split("\n").length >= 3,
        checkDesc: "Должно быть минимум 3 строки вывода",
      },
      {
        id: "5b",
        text: "Создайте словарь student с ключами name, age, grade. Выведите каждое значение.",
        hint: "student = {'name': 'Аня', 'age': 20, 'grade': 'A'}\nfor key, value in student.items():\n    print(f'{key}: {value}')",
        check: (output) => output.includes("name") || output.includes("age") || output.includes("grade"),
        checkDesc: "Должны быть ключи словаря",
      },
    ],
  },
];

const STORAGE_KEY = "pylab_progress_v2";

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Fake Python runner using eval-like logic for demo
function runPython(code) {
  const lines = [];
  const fakeEnv = {};

  const printFn = (...args) => {
    lines.push(args.map(String).join(" "));
  };

  try {
    const jsCode = convertPythonToJS(code);
    const fn = new Function("print", "range", "len", "str", "int", "float", jsCode);
    fn(
      printFn,
      (start, end, step = 1) => {
        if (end === undefined) { end = start; start = 0; }
        const arr = [];
        for (let i = start; i < end; i += step) arr.push(i);
        return arr;
      },
      (x) => (Array.isArray(x) ? x.length : String(x).length),
      String,
      parseInt,
      parseFloat
    );
    return { output: lines.join("\n") || "(нет вывода)", error: null };
  } catch (e) {
    return { output: "", error: e.message };
  }
}

function convertPythonToJS(code) {
  let js = code;

  // f-strings
  js = js.replace(/f['"]([^'"]*)['"]/g, (_, s) => {
    const converted = s.replace(/\{([^}]+)\}/g, "${$1}");
    return "`" + converted + "`";
  });

  // print() already OK
  // def → function
  js = js.replace(/^def (\w+)\(([^)]*)\):/gm, "function $1($2) {");
  // if/elif/else
  js = js.replace(/^(\s*)elif (.+):/gm, "$1} else if ($2) {");
  js = js.replace(/^(\s*)if (.+):/gm, "$1if ($2) {");
  js = js.replace(/^(\s*)else:/gm, "$1} else {");
  // for in range
  js = js.replace(/^(\s*)for (\w+) in range\((.+)\):/gm, "$1for (const $2 of range($3)) {");
  // for x in list
  js = js.replace(/^(\s*)for (\w+) in (\w+)\.items\(\):/gm, "$1for (const [$2_key, $2_value] of Object.entries($3)) { const [$2] = [[$2_key, $2_value]];");
  js = js.replace(/^(\s*)for (\w+) in (\w+):/gm, "$1for (const $2 of $3) {");
  // return
  js = js.replace(/^(\s*)return (.+)$/gm, "$1return $2;");
  // True/False/None
  js = js.replace(/\bTrue\b/g, "true").replace(/\bFalse\b/g, "false").replace(/\bNone\b/g, "null");
  // len()
  js = js.replace(/len\((\w+)\)/g, "len($1)");
  // list literal assignment — basic
  // dict literal
  // Indent-based block closing
  js = closeBlocks(js);

  return js;
}

function closeBlocks(code) {
  const lines = code.split("\n");
  const result = [];
  const indents = [0];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();
    if (!trimmed) { result.push(""); continue; }
    const indent = line.length - trimmed.length;
    const nextLine = lines[i + 1] || "";
    const nextTrimmed = nextLine.trimStart();
    const nextIndent = nextLine.length - nextTrimmed.length;

    result.push(line);

    if (nextTrimmed && nextIndent < indent) {
      let cur = indents[indents.length - 1];
      while (indents.length > 1 && indents[indents.length - 1] > nextIndent) {
        indents.pop();
        result.push(" ".repeat(indents[indents.length - 1]) + "}");
      }
    }
    if (trimmed.endsWith("{")) {
      indents.push(indent + 4);
    }
  }
  while (indents.length > 1) {
    indents.pop();
    result.push("}");
  }
  return result.join("\n");
}

const COLORS = {
  bg: "#0f1117",
  surface: "#1a1d27",
  card: "#20232f",
  border: "#2d3144",
  accent: "#6c63ff",
  accentLight: "#8b84ff",
  green: "#22c55e",
  red: "#ef4444",
  yellow: "#f59e0b",
  textPrimary: "#f0f0f8",
  textSecondary: "#8b8fa8",
  textMuted: "#5a5e75",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Syne:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${COLORS.bg}; color: ${COLORS.textPrimary}; font-family: 'Syne', sans-serif; user-select: none; -webkit-user-select: none; }
  input, textarea { user-select: text; -webkit-user-select: text; }
  
  .login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: ${COLORS.bg}; position: relative; overflow: hidden; }
  .login-glow { position: absolute; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%,-50%); pointer-events: none; }
  .login-card { background: ${COLORS.surface}; border: 1px solid ${COLORS.border}; border-radius: 20px; padding: 48px; width: 420px; position: relative; z-index: 1; }
  .login-logo { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: ${COLORS.accent}; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 32px; }
  .login-title { font-size: 32px; font-weight: 700; line-height: 1.15; margin-bottom: 8px; }
  .login-sub { font-size: 15px; color: ${COLORS.textSecondary}; margin-bottom: 36px; }
  .field-label { font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${COLORS.textSecondary}; margin-bottom: 8px; }
  .field-input { width: 100%; background: ${COLORS.card}; border: 1px solid ${COLORS.border}; border-radius: 10px; padding: 14px 16px; font-size: 16px; color: ${COLORS.textPrimary}; font-family: 'Syne', sans-serif; outline: none; transition: border-color 0.2s; }
  .field-input:focus { border-color: ${COLORS.accent}; }
  .field-input::placeholder { color: ${COLORS.textMuted}; }
  .btn-primary { width: 100%; background: ${COLORS.accent}; color: #fff; border: none; border-radius: 10px; padding: 15px; font-size: 16px; font-weight: 600; font-family: 'Syne', sans-serif; cursor: pointer; transition: background 0.2s, transform 0.1s; margin-top: 24px; }
  .btn-primary:hover { background: ${COLORS.accentLight}; }
  .btn-primary:active { transform: scale(0.98); }
  .btn-secondary { background: transparent; color: ${COLORS.textSecondary}; border: 1px solid ${COLORS.border}; border-radius: 10px; padding: 10px 18px; font-size: 14px; font-family: 'Syne', sans-serif; cursor: pointer; transition: all 0.2s; }
  .btn-secondary:hover { border-color: ${COLORS.accent}; color: ${COLORS.accent}; }
  
  .app-wrap { min-height: 100vh; display: flex; flex-direction: column; }
  .topbar { background: ${COLORS.surface}; border-bottom: 1px solid ${COLORS.border}; padding: 0 24px; height: 56px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
  .topbar-logo { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: ${COLORS.accent}; letter-spacing: 0.1em; }
  .topbar-user { display: flex; align-items: center; gap: 10px; }
  .avatar { width: 32px; height: 32px; border-radius: 50%; background: ${COLORS.accent}22; border: 1.5px solid ${COLORS.accent}44; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: ${COLORS.accentLight}; }
  .username { font-size: 14px; color: ${COLORS.textSecondary}; }
  
  .main-layout { display: flex; flex: 1; }
  .sidebar { width: 260px; background: ${COLORS.surface}; border-right: 1px solid ${COLORS.border}; padding: 20px 12px; flex-shrink: 0; }
  .sidebar-title { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: ${COLORS.textMuted}; padding: 0 8px; margin-bottom: 12px; }
  .lab-item { display: flex; align-items: center; gap: 10px; padding: 10px 10px; border-radius: 8px; cursor: pointer; transition: background 0.15s; margin-bottom: 2px; }
  .lab-item:hover { background: ${COLORS.card}; }
  .lab-item.active { background: ${COLORS.accent}18; }
  .lab-item.locked { opacity: 0.4; cursor: not-allowed; }
  .lab-num { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: ${COLORS.textMuted}; width: 20px; }
  .lab-name { font-size: 13px; flex: 1; }
  .lab-item.active .lab-name { color: ${COLORS.accentLight}; font-weight: 600; }
  .lab-badge { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; }
  .badge-done { background: ${COLORS.green}22; color: ${COLORS.green}; }
  .badge-lock { background: ${COLORS.textMuted}22; color: ${COLORS.textMuted}; }
  .badge-cur { background: ${COLORS.accent}22; color: ${COLORS.accent}; }
  
  .content { flex: 1; padding: 32px; overflow-y: auto; max-width: 900px; }
  .lab-header { margin-bottom: 28px; }
  .lab-number { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: ${COLORS.accent}; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
  .lab-title { font-size: 26px; font-weight: 700; margin-bottom: 8px; }
  .lab-desc { font-size: 15px; color: ${COLORS.textSecondary}; line-height: 1.6; }
  
  .progress-bar-wrap { height: 4px; background: ${COLORS.border}; border-radius: 2px; margin-bottom: 28px; overflow: hidden; }
  .progress-bar { height: 100%; background: ${COLORS.accent}; border-radius: 2px; transition: width 0.5s ease; }
  
  .task-card { background: ${COLORS.surface}; border: 1px solid ${COLORS.border}; border-radius: 16px; padding: 24px; margin-bottom: 20px; }
  .task-card.done { border-color: ${COLORS.green}44; }
  .task-top { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
  .task-icon { width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
  .task-icon.pending { background: ${COLORS.accent}22; color: ${COLORS.accent}; }
  .task-icon.done { background: ${COLORS.green}22; color: ${COLORS.green}; }
  .task-text { font-size: 15px; line-height: 1.6; flex: 1; }
  
  .editor-wrap { position: relative; margin-bottom: 12px; }
  .editor-label { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: ${COLORS.textMuted}; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
  .code-editor { width: 100%; background: ${COLORS.bg}; border: 1px solid ${COLORS.border}; border-radius: 10px; padding: 14px 16px; font-size: 14px; color: ${COLORS.textPrimary}; font-family: 'JetBrains Mono', monospace; line-height: 1.6; resize: vertical; min-height: 120px; outline: none; transition: border-color 0.2s; tab-size: 4; }
  .code-editor:focus { border-color: ${COLORS.accent}66; }
  
  .editor-actions { display: flex; gap: 8px; margin-bottom: 10px; }
  .btn-run { background: ${COLORS.accent}; color: #fff; border: none; border-radius: 8px; padding: 9px 18px; font-size: 13px; font-weight: 600; font-family: 'Syne', sans-serif; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.2s; }
  .btn-run:hover { background: ${COLORS.accentLight}; }
  .btn-hint { background: transparent; color: ${COLORS.textSecondary}; border: 1px solid ${COLORS.border}; border-radius: 8px; padding: 9px 14px; font-size: 13px; font-family: 'Syne', sans-serif; cursor: pointer; transition: all 0.2s; }
  .btn-hint:hover { border-color: ${COLORS.accent}; color: ${COLORS.accent}; }
  .btn-reset { background: transparent; color: ${COLORS.textMuted}; border: 1px solid ${COLORS.border}; border-radius: 8px; padding: 9px 12px; font-size: 13px; font-family: 'Syne', sans-serif; cursor: pointer; transition: all 0.2s; }
  .btn-reset:hover { color: ${COLORS.red}; border-color: ${COLORS.red}44; }
  
  .output-box { background: ${COLORS.bg}; border: 1px solid ${COLORS.border}; border-radius: 10px; padding: 12px 16px; font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.7; white-space: pre-wrap; min-height: 48px; }
  .output-box.success { border-color: ${COLORS.green}44; }
  .output-box.error { border-color: ${COLORS.red}44; color: ${COLORS.red}; }
  .output-label { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: ${COLORS.textMuted}; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
  
  .result-banner { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; margin-top: 10px; }
  .result-banner.ok { background: ${COLORS.green}18; color: ${COLORS.green}; }
  .result-banner.fail { background: ${COLORS.yellow}18; color: ${COLORS.yellow}; }
  
  .hint-box { background: ${COLORS.accent}0d; border: 1px solid ${COLORS.accent}33; border-radius: 10px; padding: 14px 16px; font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.7; white-space: pre-wrap; color: ${COLORS.accentLight}; margin-bottom: 12px; }
  
  .next-btn { display: flex; align-items: center; gap: 6px; background: ${COLORS.accent}; color: #fff; border: none; border-radius: 10px; padding: 13px 22px; font-size: 15px; font-weight: 600; font-family: 'Syne', sans-serif; cursor: pointer; transition: background 0.2s; margin-top: 20px; }
  .next-btn:hover { background: ${COLORS.accentLight}; }
  
  .done-card { background: ${COLORS.green}0f; border: 1px solid ${COLORS.green}33; border-radius: 16px; padding: 32px; text-align: center; }
  .done-icon { font-size: 48px; margin-bottom: 12px; }
  .done-title { font-size: 22px; font-weight: 700; color: ${COLORS.green}; margin-bottom: 8px; }
  .done-sub { font-size: 15px; color: ${COLORS.textSecondary}; }
  
  /* Teacher panel */
  .teacher-wrap { flex: 1; padding: 32px; overflow-y: auto; }
  .teacher-title { font-size: 28px; font-weight: 700; margin-bottom: 6px; }
  .teacher-sub { font-size: 14px; color: ${COLORS.textSecondary}; margin-bottom: 28px; }
  .stats-row { display: flex; gap: 16px; margin-bottom: 32px; flex-wrap: wrap; }
  .stat-card { background: ${COLORS.surface}; border: 1px solid ${COLORS.border}; border-radius: 12px; padding: 20px 24px; flex: 1; min-width: 140px; }
  .stat-val { font-size: 32px; font-weight: 700; margin-bottom: 4px; }
  .stat-label { font-size: 13px; color: ${COLORS.textSecondary}; }
  .student-grid { display: grid; gap: 12px; }
  .student-row { background: ${COLORS.surface}; border: 1px solid ${COLORS.border}; border-radius: 12px; padding: 18px 20px; }
  .student-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
  .student-name { font-size: 16px; font-weight: 600; flex: 1; }
  .student-time { font-size: 12px; color: ${COLORS.textMuted}; font-family: 'JetBrains Mono', monospace; }
  .lab-progress-row { display: flex; gap: 6px; flex-wrap: wrap; }
  .lp-chip { font-size: 11px; font-family: 'JetBrains Mono', monospace; padding: 3px 9px; border-radius: 5px; }
  .lp-done { background: ${COLORS.green}22; color: ${COLORS.green}; }
  .lp-partial { background: ${COLORS.yellow}22; color: ${COLORS.yellow}; }
  .lp-none { background: ${COLORS.border}; color: ${COLORS.textMuted}; }
  .empty-state { text-align: center; padding: 60px; color: ${COLORS.textMuted}; font-size: 15px; }
  
  .tab-row { display: flex; gap: 2px; background: ${COLORS.surface}; border-bottom: 1px solid ${COLORS.border}; padding: 0 24px; }
  .tab-btn { padding: 14px 18px; font-size: 14px; font-weight: 500; font-family: 'Syne', sans-serif; color: ${COLORS.textSecondary}; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.15s; margin-bottom: -1px; }
  .tab-btn.active { color: ${COLORS.accentLight}; border-bottom-color: ${COLORS.accent}; }
  .tab-btn:hover { color: ${COLORS.textPrimary}; }
  
  .overall-bar { display: flex; align-items: center; gap: 10px; }
  .mini-bar-wrap { flex: 1; height: 6px; background: ${COLORS.border}; border-radius: 3px; overflow: hidden; }
  .mini-bar { height: 100%; background: ${COLORS.accent}; border-radius: 3px; transition: width 0.5s; }
  .pct-label { font-size: 12px; font-family: 'JetBrains Mono', monospace; color: ${COLORS.textSecondary}; width: 36px; text-align: right; }
  
  .code-view { font-size: 12px; font-family: 'JetBrains Mono', monospace; color: ${COLORS.textSecondary}; background: ${COLORS.bg}; border: 1px solid ${COLORS.border}; border-radius: 8px; padding: 10px 12px; white-space: pre-wrap; margin-top: 10px; max-height: 120px; overflow-y: auto; }
  .expand-btn { font-size: 12px; color: ${COLORS.textMuted}; background: none; border: none; cursor: pointer; padding: 4px 0; font-family: 'Syne', sans-serif; }
  .expand-btn:hover { color: ${COLORS.accent}; }
`;

export default function App() {
  const [screen, setScreen] = useState("login"); // login | student | teacher
  const [studentName, setStudentName] = useState("");
  const [inputName, setInputName] = useState("");
  const [role, setRole] = useState("student");
  const [teacherPass, setTeacherPass] = useState("");
  const [activeLab, setActiveLab] = useState(0);
  const [codes, setCodes] = useState({});
  const [outputs, setOutputs] = useState({});
  const [results, setResults] = useState({});
  const [hints, setHints] = useState({});
  const [labsDone, setLabsDone] = useState({});
  const [tasksDone, setTasksDone] = useState({});

  useEffect(() => {
    if (screen === "teacher") return;
    const blockCopy = (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "a" || e.key === "x")) {
        e.preventDefault();
      }
    };
    const blockCopyEvent = (e) => { e.preventDefault(); };
    const blockContext = (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
    };
    document.addEventListener("keydown", blockCopy);
    document.addEventListener("copy", blockCopyEvent);
    document.addEventListener("cut", blockCopyEvent);
    document.addEventListener("contextmenu", blockContext);
    return () => {
      document.removeEventListener("keydown", blockCopy);
      document.removeEventListener("copy", blockCopyEvent);
      document.removeEventListener("cut", blockCopyEvent);
      document.removeEventListener("contextmenu", blockContext);
    };
  }, [screen]);
  const [allStudents, setAllStudents] = useState([]);
  const [expandedStudent, setExpandedStudent] = useState(null);

  useEffect(() => {
    const saved = loadProgress();
    if (saved.students) setAllStudents(saved.students);
  }, []);

  function persistProgress(name, tDone, cds) {
    const saved = loadProgress();
    const students = saved.students || [];
    const existing = students.findIndex(s => s.name === name);
    const entry = {
      name,
      lastSeen: new Date().toISOString(),
      tasksDone: tDone,
      codes: cds,
    };
    if (existing >= 0) students[existing] = entry;
    else students.push(entry);
    saveProgress({ students });
    setAllStudents([...students]);
  }

  function handleLogin() {
    if (!inputName.trim()) return;
    const name = inputName.trim();
    setStudentName(name);

    const saved = loadProgress();
    const existing = (saved.students || []).find(s => s.name === name);
    if (existing) {
      setTasksDone(existing.tasksDone || {});
      setCodes(existing.codes || {});
    }
    setScreen("student");
    setActiveLab(0);
  }

  function handleTeacherLogin() {
    if (teacherPass === "teacher123" || teacherPass === "admin") {
      setScreen("teacher");
    } else {
      alert("Неверный пароль. Используйте: teacher123");
    }
  }

  function runCode(taskId, check) {
    const code = codes[taskId] || "";
    const { output, error } = runPython(code);
    const newOutputs = { ...outputs, [taskId]: { text: output, error } };
    setOutputs(newOutputs);

    if (!error) {
      const passed = check(output);
      const newResults = { ...results, [taskId]: passed };
      setResults(newResults);

      if (passed) {
        const newTD = { ...tasksDone, [taskId]: true };
        setTasksDone(newTD);
        persistProgress(studentName, newTD, codes);

        // Check if lab is done
        const lab = LABS[activeLab];
        const allTasksDone = lab.tasks.every(t => newTD[t.id]);
        if (allTasksDone) {
          const newLD = { ...labsDone, [activeLab]: true };
          setLabsDone(newLD);
        }
      }
    }
  }

  function setCode(taskId, val) {
    const newC = { ...codes, [taskId]: val };
    setCodes(newC);
  }

  function toggleHint(taskId) {
    setHints(h => ({ ...h, [taskId]: !h[taskId] }));
  }

  function resetCode(taskId) {
    setCode(taskId, "");
    setOutputs(o => ({ ...o, [taskId]: null }));
    setResults(r => ({ ...r, [taskId]: undefined }));
  }

  // Figure out which labs are unlocked
  function isLabUnlocked(idx) {
    if (idx === 0) return true;
    const prevLab = LABS[idx - 1];
    return prevLab.tasks.every(t => tasksDone[t.id]);
  }

  const currentLab = LABS[activeLab];
  const totalTasks = LABS.reduce((s, l) => s + l.tasks.length, 0);
  const doneTasks = Object.keys(tasksDone).filter(k => tasksDone[k]).length;
  const labProgress = currentLab.tasks.filter(t => tasksDone[t.id]).length / currentLab.tasks.length;

  if (screen === "login") {
    return (
      <>
        <style>{css}</style>
        <div className="login-wrap">
          <div className="login-glow" />
          <div className="login-card">
            <div className="login-logo">Python Labs 🐍</div>
            <h1 className="login-title">Добро пожаловать</h1>
            <p className="login-sub">Введите своё имя, чтобы начать выполнять лабораторные работы</p>

            <div className="field-label">Ваше имя</div>
            <input
              className="field-input"
              placeholder="Например: Айгерим Жакупова"
              value={inputName}
              onChange={e => setInputName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />

            <button className="btn-primary" onClick={handleLogin}>
              Начать выполнение →
            </button>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <button
                onClick={() => setRole(r => r === "teacher" ? "student" : "teacher")}
                style={{ background: "none", border: "none", fontSize: 11, color: COLORS.textMuted, cursor: "pointer", fontFamily: "'Syne', sans-serif" }}
              >
                Преподаватель
              </button>
            </div>

            {role === "teacher" && (
              <div style={{ marginTop: 12, padding: "16px", background: COLORS.card, borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
                <div className="field-label">Пароль преподавателя</div>
                <input
                  className="field-input"
                  type="password"
                  placeholder="Введите пароль"
                  value={teacherPass}
                  onChange={e => setTeacherPass(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleTeacherLogin()}
                  style={{ marginBottom: 10 }}
                />
                <button className="btn-primary" style={{ marginTop: 0 }} onClick={handleTeacherLogin}>
                  Войти →
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  if (screen === "teacher") {
    const totalStudents = allStudents.length;
    const activeStudents = allStudents.filter(s => {
      const diff = Date.now() - new Date(s.lastSeen).getTime();
      return diff < 30 * 60 * 1000;
    }).length;
    const avgPct = totalStudents === 0 ? 0 : Math.round(
      allStudents.reduce((sum, s) => {
        const done = Object.values(s.tasksDone || {}).filter(Boolean).length;
        return sum + done / totalTasks * 100;
      }, 0) / totalStudents
    );

    return (
      <>
        <style>{css}</style>
        <div className="app-wrap">
          <div className="topbar">
            <div className="topbar-logo">Python Labs — Панель преподавателя</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-secondary" onClick={() => {
                setAllStudents(loadProgress().students || []);
              }}>↻ Обновить</button>
              <button className="btn-secondary" onClick={() => setScreen("login")}>Выйти</button>
            </div>
          </div>

          <div className="teacher-wrap">
            <h1 className="teacher-title">Прогресс студентов</h1>
            <p className="teacher-sub">
              Отслеживайте выполнение лабораторных работ в реальном времени
            </p>

            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-val" style={{ color: COLORS.accentLight }}>{totalStudents}</div>
                <div className="stat-label">Всего студентов</div>
              </div>
              <div className="stat-card">
                <div className="stat-val" style={{ color: COLORS.green }}>{activeStudents}</div>
                <div className="stat-label">Активны (30 мин)</div>
              </div>
              <div className="stat-card">
                <div className="stat-val" style={{ color: COLORS.yellow }}>{avgPct}%</div>
                <div className="stat-label">Средний прогресс</div>
              </div>
              <div className="stat-card">
                <div className="stat-val">{totalTasks}</div>
                <div className="stat-label">Заданий всего</div>
              </div>
            </div>

            <div className="student-grid">
              {allStudents.length === 0 && (
                <div className="empty-state">Пока нет данных о студентах. Студенты появятся здесь после входа в систему.</div>
              )}
              {allStudents.map((s, i) => {
                const td = s.tasksDone || {};
                const done = Object.values(td).filter(Boolean).length;
                const pct = Math.round(done / totalTasks * 100);
                const isExpanded = expandedStudent === i;
                const lastSeen = new Date(s.lastSeen);
                const diff = Math.round((Date.now() - lastSeen.getTime()) / 60000);
                const online = diff < 30;

                return (
                  <div className="student-row" key={i}>
                    <div className="student-head">
                      <div className="avatar" style={{ background: online ? COLORS.green + "22" : COLORS.accent + "22", color: online ? COLORS.green : COLORS.accentLight }}>
                        {s.name[0].toUpperCase()}
                      </div>
                      <div className="student-name">{s.name}</div>
                      <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 5, background: online ? COLORS.green + "22" : COLORS.border, color: online ? COLORS.green : COLORS.textMuted }}>
                        {online ? "● онлайн" : diff < 60 ? `${diff} мин назад` : lastSeen.toLocaleDateString("ru-RU")}
                      </span>
                      <div className="overall-bar" style={{ width: 150 }}>
                        <div className="mini-bar-wrap"><div className="mini-bar" style={{ width: pct + "%" }} /></div>
                        <div className="pct-label">{pct}%</div>
                      </div>
                      <button className="expand-btn" onClick={() => setExpandedStudent(isExpanded ? null : i)}>
                        {isExpanded ? "Свернуть ▲" : "Подробнее ▼"}
                      </button>
                    </div>

                    <div className="lab-progress-row">
                      {LABS.map((lab, li) => {
                        const labDone = lab.tasks.filter(t => td[t.id]).length;
                        const cls = labDone === lab.tasks.length ? "lp-chip lp-done" : labDone > 0 ? "lp-chip lp-partial" : "lp-chip lp-none";
                        return (
                          <span key={li} className={cls}>
                            Лаб {lab.id}: {labDone}/{lab.tasks.length}
                          </span>
                        );
                      })}
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: 16 }}>
                        {LABS.map((lab, li) => (
                          <div key={li} style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textSecondary, marginBottom: 8 }}>
                              Лабораторная #{lab.id}: {lab.title}
                            </div>
                            {lab.tasks.map(task => (
                              <div key={task.id} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 14px", marginBottom: 6 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                  <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 4, background: td[task.id] ? COLORS.green + "22" : COLORS.border, color: td[task.id] ? COLORS.green : COLORS.textMuted }}>
                                    {td[task.id] ? "✓ Выполнено" : "○ Не выполнено"}
                                  </span>
                                  <span style={{ fontSize: 12, color: COLORS.textMuted }}>Задание {task.id}</span>
                                </div>
                                <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{task.text}</div>
                                {s.codes && s.codes[task.id] && (
                                  <div className="code-view">{s.codes[task.id]}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Student screen
  return (
    <>
      <style>{css}</style>
      <div className="app-wrap">
        <div className="topbar">
          <div className="topbar-logo">🐍 Python Labs</div>
          <div className="topbar-user">
            <div style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: "JetBrains Mono, monospace" }}>
              {doneTasks}/{totalTasks} заданий
            </div>
            <div className="avatar">{studentName[0].toUpperCase()}</div>
            <div className="username">{studentName}</div>
            <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setScreen("login")}>Выйти</button>
          </div>
        </div>

        <div className="main-layout">
          <div className="sidebar">
            <div className="sidebar-title">Лабораторные</div>
            {LABS.map((lab, idx) => {
              const unlocked = isLabUnlocked(idx);
              const done = lab.tasks.every(t => tasksDone[t.id]);
              const active = activeLab === idx;
              return (
                <div
                  key={idx}
                  className={`lab-item ${active ? "active" : ""} ${!unlocked ? "locked" : ""}`}
                  onClick={() => unlocked && setActiveLab(idx)}
                >
                  <span className="lab-num">{lab.id}</span>
                  <span className="lab-name">{lab.title}</span>
                  <span className={`lab-badge ${done ? "badge-done" : !unlocked ? "badge-lock" : active ? "badge-cur" : ""}`}>
                    {done ? "✓" : !unlocked ? "🔒" : ""}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="content">
            <div className="lab-header">
              <div className="lab-number">Лабораторная работа №{currentLab.id}</div>
              <h2 className="lab-title">{currentLab.title}</h2>
              <p className="lab-desc">{currentLab.description}</p>
            </div>

            <div className="progress-bar-wrap">
              <div className="progress-bar" style={{ width: (labProgress * 100) + "%" }} />
            </div>

            {currentLab.tasks.map((task, ti) => {
              const isDone = tasksDone[task.id];
              const out = outputs[task.id];
              const res = results[task.id];
              const showHint = hints[task.id];

              return (
                <div key={task.id} className={`task-card ${isDone ? "done" : ""}`}>
                  <div className="task-top">
                    <div className={`task-icon ${isDone ? "done" : "pending"}`}>
                      {isDone ? "✓" : ti + 1}
                    </div>
                    <div className="task-text">{task.text}</div>
                  </div>

                  {showHint && (
                    <div className="hint-box">{task.hint}</div>
                  )}

                  <div className="editor-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>Ваш код</span>
                    <span style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: "JetBrains Mono, monospace" }}>вставка запрещена</span>
                  </div>
                  <div className="editor-wrap">
                    <textarea
                      className="code-editor"
                      value={codes[task.id] || ""}
                      onChange={e => setCode(task.id, e.target.value)}
                      placeholder="# Напишите ваш Python код здесь..."
                      spellCheck={false}
                      onPaste={e => { e.preventDefault(); }}
                      onDrop={e => { e.preventDefault(); }}
                      onContextMenu={e => { e.preventDefault(); }}
                      onKeyDown={e => {
                        // Block Ctrl+V / Cmd+V (paste)
                        if ((e.ctrlKey || e.metaKey) && e.key === "v") {
                          e.preventDefault();
                          return;
                        }
                        // Block Ctrl+Z / Cmd+Z undo that could restore pasted text
                        // Allow normal undo for typed chars — only block if clipboard involved (can't detect, so allow undo)
                        // Block Tab → indent
                        if (e.key === "Tab") {
                          e.preventDefault();
                          const s = e.target.selectionStart;
                          const v = e.target.value;
                          const newVal = v.substring(0, s) + "    " + v.substring(e.target.selectionEnd);
                          setCode(task.id, newVal);
                          setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s + 4; }, 0);
                        }
                      }}
                    />
                  </div>

                  <div className="editor-actions">
                    <button className="btn-run" onClick={() => runCode(task.id, task.check)}>
                      ▶ Запустить
                    </button>
                    <button className="btn-hint" onClick={() => toggleHint(task.id)}>
                      {showHint ? "Скрыть подсказку" : "Подсказка"}
                    </button>
                    <button className="btn-reset" onClick={() => resetCode(task.id)}>✕</button>
                  </div>

                  {out && (
                    <>
                      <div className="output-label">Вывод</div>
                      <div className={`output-box ${out.error ? "error" : res === true ? "success" : ""}`}>
                        {out.error ? `Ошибка: ${out.error}` : out.text}
                      </div>
                      {!out.error && res !== undefined && (
                        <div className={`result-banner ${res ? "ok" : "fail"}`}>
                          {res ? "✓ Правильно! Задание выполнено." : `✗ Проверьте результат: ${task.checkDesc}`}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}

            {currentLab.tasks.every(t => tasksDone[t.id]) && activeLab < LABS.length - 1 && (
              <button className="next-btn" onClick={() => setActiveLab(activeLab + 1)}>
                Следующая лабораторная →
              </button>
            )}

            {currentLab.tasks.every(t => tasksDone[t.id]) && activeLab === LABS.length - 1 && (
              <div className="done-card">
                <div className="done-icon">🎉</div>
                <div className="done-title">Все лабораторные выполнены!</div>
                <div className="done-sub">Поздравляем, {studentName}! Вы завершили все задания курса.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
