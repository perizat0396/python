import { useState, useEffect } from "react";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ─── ЗАМЕНИТЕ НА ВАШИ ДАННЫЕ ИЗ FIREBASE CONSOLE ───────────────────────────
const firebaseConfig = {
 apiKey: "AIzaSyBHDk36nR_s55nnmqcAYH9xBMr_y2eF7BY",
  authDomain: "python-8aef8.firebaseapp.com",
  projectId: "python-8aef8",
  storageBucket: "python-8aef8.firebasestorage.app",
  messagingSenderId: "1005011787566",
  appId: "1:1005011787566:web:3937fbfc621c992dc3e4bf",
  measurementId: "G-PRW3W622VT"
};
// ─── EMAIL ПРЕПОДАВАТЕЛЯ (ваш Google аккаунт) ───────────────────────────────
const TEACHER_EMAIL = "ВАШ_EMAIL@gmail.com";
// ────────────────────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

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
        check: (o) => o.trim().length > 0,
        checkDesc: "Должен быть любой вывод",
      },
      {
        id: "1b",
        text: "Создайте две переменные a=10 и b=3, выведите их сумму, разность, произведение и частное.",
        hint: "a = 10\nb = 3\nprint(a + b)\nprint(a - b)\nprint(a * b)\nprint(a / b)",
        check: (o) => o.includes("13") && o.includes("7") && o.includes("30"),
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
        check: (o) => o.includes("Большое"),
        checkDesc: "Должно вывестись 'Большое'",
      },
      {
        id: "2b",
        text: "Напишите программу определения оценки: score=85. A(90+), B(75-89), C(60-74), F(ниже 60).",
        hint: "score = 85\nif score >= 90:\n    print('A')\nelif score >= 75:\n    print('B')\nelif score >= 60:\n    print('C')\nelse:\n    print('F')",
        check: (o) => o.trim().includes("B"),
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
        check: (o) => o.includes("1") && o.includes("10"),
        checkDesc: "Должны быть числа от 1 до 10",
      },
      {
        id: "3b",
        text: "Выведите таблицу умножения числа 7 (от 7×1 до 7×10).",
        hint: "for i in range(1, 11):\n    print(f'7 × {i} = {7*i}')",
        check: (o) => o.includes("49") && o.includes("70"),
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
        check: (o) => o.includes("Привет") && o.includes("Мир"),
        checkDesc: "Должно вывестись 'Привет, Мир!'",
      },
      {
        id: "4b",
        text: "Напишите функцию factorial(n), вычисляющую факториал числа. Проверьте: factorial(5) = 120.",
        hint: "def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(5))",
        check: (o) => o.includes("120"),
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
        check: (o) => o.split("\n").length >= 3,
        checkDesc: "Должно быть минимум 3 строки вывода",
      },
      {
        id: "5b",
        text: "Создайте словарь student с ключами name, age, grade. Выведите каждое значение.",
        hint: "student = {'name': 'Аня', 'age': 20, 'grade': 'A'}\nfor key, value in student.items():\n    print(f'{key}: {value}')",
        check: (o) => o.includes("name") || o.includes("age") || o.includes("grade"),
        checkDesc: "Должны быть ключи словаря",
      },
    ],
  },
];

function runPython(code) {
  const lines = [];
  const printFn = (...args) => lines.push(args.map(String).join(" "));
  try {
    const jsCode = convertPythonToJS(code);
    const fn = new Function("print", "range", "len", "str", "int", "float", jsCode);
    fn(
      printFn,
      (start, end, step = 1) => { if (end === undefined) { end = start; start = 0; } const a = []; for (let i = start; i < end; i += step) a.push(i); return a; },
      (x) => (Array.isArray(x) ? x.length : String(x).length),
      String, parseInt, parseFloat
    );
    return { output: lines.join("\n") || "(нет вывода)", error: null };
  } catch (e) {
    return { output: "", error: e.message };
  }
}

function convertPythonToJS(code) {
  let js = code;
  js = js.replace(/f['"]([^'"]*)['"]/g, (_, s) => "`" + s.replace(/\{([^}]+)\}/g, "${$1}") + "`");
  js = js.replace(/^def (\w+)\(([^)]*)\):/gm, "function $1($2) {");
  js = js.replace(/^(\s*)elif (.+):/gm, "$1} else if ($2) {");
  js = js.replace(/^(\s*)if (.+):/gm, "$1if ($2) {");
  js = js.replace(/^(\s*)else:/gm, "$1} else {");
  js = js.replace(/^(\s*)for (\w+) in range\((.+)\):/gm, "$1for (const $2 of range($3)) {");
  js = js.replace(/^(\s*)for (\w+) in (\w+):/gm, "$1for (const $2 of $3) {");
  js = js.replace(/^(\s*)return (.+)$/gm, "$1return $2;");
  js = js.replace(/\bTrue\b/g, "true").replace(/\bFalse\b/g, "false").replace(/\bNone\b/g, "null");
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
      while (indents.length > 1 && indents[indents.length - 1] > nextIndent) {
        indents.pop();
        result.push(" ".repeat(indents[indents.length - 1]) + "}");
      }
    }
    if (trimmed.endsWith("{")) indents.push(indent + 4);
  }
  while (indents.length > 1) { indents.pop(); result.push("}"); }
  return result.join("\n");
}

const C = {
  bg: "#0f1117", surface: "#1a1d27", card: "#20232f", border: "#2d3144",
  accent: "#6c63ff", accentLight: "#8b84ff", green: "#22c55e", red: "#ef4444",
  yellow: "#f59e0b", textPrimary: "#f0f0f8", textSecondary: "#8b8fa8", textMuted: "#5a5e75",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Syne:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.textPrimary}; font-family: 'Syne', sans-serif; user-select: none; -webkit-user-select: none; }
  input, textarea { user-select: text; -webkit-user-select: text; }
  .center { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  .glow { position: absolute; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%,-50%); pointer-events: none; }
  .card { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 20px; padding: 48px; width: 440px; position: relative; z-index: 1; }
  .logo { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: ${C.accent}; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 32px; }
  .title { font-size: 30px; font-weight: 700; line-height: 1.2; margin-bottom: 8px; }
  .sub { font-size: 15px; color: ${C.textSecondary}; margin-bottom: 36px; line-height: 1.6; }
  .lbl { font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${C.textSecondary}; margin-bottom: 8px; }
  .inp { width: 100%; background: ${C.card}; border: 1px solid ${C.border}; border-radius: 10px; padding: 14px 16px; font-size: 16px; color: ${C.textPrimary}; font-family: 'Syne', sans-serif; outline: none; transition: border-color 0.2s; }
  .inp:focus { border-color: ${C.accent}; }
  .inp::placeholder { color: ${C.textMuted}; }
  .btn { width: 100%; border: none; border-radius: 10px; padding: 15px; font-size: 15px; font-weight: 600; font-family: 'Syne', sans-serif; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 12px; }
  .btn-purple { background: ${C.accent}; color: #fff; }
  .btn-purple:hover { background: ${C.accentLight}; }
  .btn-google { background: #fff; color: #333; border: 1px solid #ddd; }
  .btn-google:hover { background: #f5f5f5; }
  .btn-sm { background: transparent; color: ${C.textSecondary}; border: 1px solid ${C.border}; border-radius: 8px; padding: 8px 14px; font-size: 13px; font-family: 'Syne', sans-serif; cursor: pointer; transition: all 0.2s; }
  .btn-sm:hover { border-color: ${C.accent}; color: ${C.accent}; }
  .app { min-height: 100vh; display: flex; flex-direction: column; }
  .topbar { background: ${C.surface}; border-bottom: 1px solid ${C.border}; padding: 0 24px; height: 56px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
  .topbar-logo { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: ${C.accent}; letter-spacing: 0.1em; }
  .topbar-right { display: flex; align-items: center; gap: 10px; }
  .avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1.5px solid ${C.accent}44; }
  .avatar-txt { width: 32px; height: 32px; border-radius: 50%; background: ${C.accent}22; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: ${C.accentLight}; }
  .uname { font-size: 14px; color: ${C.textSecondary}; }
  .layout { display: flex; flex: 1; }
  .sidebar { width: 260px; background: ${C.surface}; border-right: 1px solid ${C.border}; padding: 20px 12px; flex-shrink: 0; }
  .s-title { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: ${C.textMuted}; padding: 0 8px; margin-bottom: 12px; }
  .lab-item { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 8px; cursor: pointer; transition: background 0.15s; margin-bottom: 2px; }
  .lab-item:hover { background: ${C.card}; }
  .lab-item.active { background: ${C.accent}18; }
  .lab-item.locked { opacity: 0.4; cursor: not-allowed; }
  .lab-num { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: ${C.textMuted}; width: 20px; }
  .lab-name { font-size: 13px; flex: 1; }
  .lab-item.active .lab-name { color: ${C.accentLight}; font-weight: 600; }
  .badge { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; }
  .b-done { background: ${C.green}22; color: ${C.green}; }
  .b-lock { background: ${C.textMuted}22; color: ${C.textMuted}; }
  .content { flex: 1; padding: 32px; overflow-y: auto; max-width: 900px; }
  .lab-no { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: ${C.accent}; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
  .lab-ttl { font-size: 26px; font-weight: 700; margin-bottom: 8px; }
  .lab-dsc { font-size: 15px; color: ${C.textSecondary}; line-height: 1.6; }
  .prog-wrap { height: 4px; background: ${C.border}; border-radius: 2px; margin: 20px 0 28px; overflow: hidden; }
  .prog-bar { height: 100%; background: ${C.accent}; border-radius: 2px; transition: width 0.5s ease; }
  .task { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 16px; padding: 24px; margin-bottom: 20px; }
  .task.done { border-color: ${C.green}44; }
  .task-top { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
  .task-ico { width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
  .ico-pend { background: ${C.accent}22; color: ${C.accent}; }
  .ico-done { background: ${C.green}22; color: ${C.green}; }
  .task-txt { font-size: 15px; line-height: 1.6; flex: 1; }
  .el { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: ${C.textMuted}; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
  .editor { width: 100%; background: ${C.bg}; border: 1px solid ${C.border}; border-radius: 10px; padding: 14px 16px; font-size: 14px; color: ${C.textPrimary}; font-family: 'JetBrains Mono', monospace; line-height: 1.6; resize: vertical; min-height: 120px; outline: none; transition: border-color 0.2s; tab-size: 4; margin-bottom: 10px; }
  .editor:focus { border-color: ${C.accent}66; }
  .actions { display: flex; gap: 8px; margin-bottom: 10px; }
  .run-btn { background: ${C.accent}; color: #fff; border: none; border-radius: 8px; padding: 9px 18px; font-size: 13px; font-weight: 600; font-family: 'Syne', sans-serif; cursor: pointer; }
  .run-btn:hover { background: ${C.accentLight}; }
  .hint-btn { background: transparent; color: ${C.textSecondary}; border: 1px solid ${C.border}; border-radius: 8px; padding: 9px 14px; font-size: 13px; font-family: 'Syne', sans-serif; cursor: pointer; }
  .hint-btn:hover { border-color: ${C.accent}; color: ${C.accent}; }
  .rst-btn { background: transparent; color: ${C.textMuted}; border: 1px solid ${C.border}; border-radius: 8px; padding: 9px 12px; font-size: 13px; font-family: 'Syne', sans-serif; cursor: pointer; }
  .rst-btn:hover { color: ${C.red}; border-color: ${C.red}44; }
  .out { background: ${C.bg}; border: 1px solid ${C.border}; border-radius: 10px; padding: 12px 16px; font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.7; white-space: pre-wrap; min-height: 48px; }
  .out.ok { border-color: ${C.green}44; }
  .out.err { border-color: ${C.red}44; color: ${C.red}; }
  .hint-box { background: ${C.accent}0d; border: 1px solid ${C.accent}33; border-radius: 10px; padding: 14px 16px; font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.7; white-space: pre-wrap; color: ${C.accentLight}; margin-bottom: 12px; }
  .res { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; margin-top: 10px; }
  .res.pass { background: ${C.green}18; color: ${C.green}; }
  .res.fail { background: ${C.yellow}18; color: ${C.yellow}; }
  .next-btn { display: flex; align-items: center; gap: 6px; background: ${C.accent}; color: #fff; border: none; border-radius: 10px; padding: 13px 22px; font-size: 15px; font-weight: 600; font-family: 'Syne', sans-serif; cursor: pointer; margin-top: 20px; }
  .next-btn:hover { background: ${C.accentLight}; }
  .fin { background: ${C.green}0f; border: 1px solid ${C.green}33; border-radius: 16px; padding: 32px; text-align: center; margin-top: 20px; }
  .t-wrap { flex: 1; padding: 32px; overflow-y: auto; }
  .stats { display: flex; gap: 16px; margin-bottom: 32px; flex-wrap: wrap; }
  .stat { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 12px; padding: 20px 24px; flex: 1; min-width: 130px; }
  .stat-v { font-size: 32px; font-weight: 700; margin-bottom: 4px; }
  .stat-l { font-size: 13px; color: ${C.textSecondary}; }
  .s-row { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 12px; padding: 18px 20px; margin-bottom: 12px; }
  .s-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .s-name { font-size: 16px; font-weight: 600; flex: 1; }
  .chips { display: flex; gap: 6px; flex-wrap: wrap; }
  .chip { font-size: 11px; font-family: 'JetBrains Mono', monospace; padding: 3px 9px; border-radius: 5px; }
  .ch-d { background: ${C.green}22; color: ${C.green}; }
  .ch-p { background: ${C.yellow}22; color: ${C.yellow}; }
  .ch-n { background: ${C.border}; color: ${C.textMuted}; }
  .mbar { display: flex; align-items: center; gap: 8px; }
  .mbar-t { flex: 1; height: 6px; background: ${C.border}; border-radius: 3px; overflow: hidden; }
  .mbar-f { height: 100%; background: ${C.accent}; border-radius: 3px; transition: width 0.5s; }
  .pct { font-size: 12px; font-family: 'JetBrains Mono', monospace; color: ${C.textSecondary}; width: 36px; text-align: right; }
  .exp-btn { font-size: 12px; color: ${C.textMuted}; background: none; border: none; cursor: pointer; font-family: 'Syne', sans-serif; }
  .exp-btn:hover { color: ${C.accent}; }
  .code-view { font-size: 12px; font-family: 'JetBrains Mono', monospace; color: ${C.textSecondary}; background: ${C.bg}; border: 1px solid ${C.border}; border-radius: 8px; padding: 10px 12px; white-space: pre-wrap; margin-top: 8px; max-height: 120px; overflow-y: auto; }
  .loading { min-height: 100vh; display: flex; align-items: center; justify-content: center; font-size: 15px; color: ${C.textSecondary}; }
  .err-box { background: ${C.red}11; border: 1px solid ${C.red}44; border-radius: 10px; padding: 12px 16px; font-size: 13px; color: ${C.red}; margin-top: 16px; line-height: 1.5; }
`;

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [screen, setScreen] = useState("login");
  const [activeLab, setActiveLab] = useState(0);
  const [codes, setCodes] = useState({});
  const [outputs, setOutputs] = useState({});
  const [results, setResults] = useState({});
  const [hints, setHints] = useState({});
  const [tasksDone, setTasksDone] = useState({});
  const [allStudents, setAllStudents] = useState([]);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [authError, setAuthError] = useState("");
  const [teacherPass, setTeacherPass] = useState("");
  const [showTeacherPass, setShowTeacherPass] = useState(false);
  const [role, setRole] = useState("student");

  const totalTasks = LABS.reduce((s, l) => s + l.tasks.length, 0);

  useEffect(() => {
    if (role === "teacher") return;
    const blockCopy = (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.ctrlKey || e.metaKey) && ["c","a","x"].includes(e.key)) e.preventDefault();
    };
    const blockEv = (e) => e.preventDefault();
    const blockCtx = (e) => { if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") e.preventDefault(); };
    document.addEventListener("keydown", blockCopy);
    document.addEventListener("copy", blockEv);
    document.addEventListener("cut", blockEv);
    document.addEventListener("contextmenu", blockCtx);
    return () => {
      document.removeEventListener("keydown", blockCopy);
      document.removeEventListener("copy", blockEv);
      document.removeEventListener("cut", blockEv);
      document.removeEventListener("contextmenu", blockCtx);
    };
  }, [role]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthLoading(false);
      if (u) {
        if (u.email === perizat0396@gmail.com) {
          setRole("teacher");
          setScreen("teacher");
          loadAllStudents();
        } else {
          setRole("student");
          setScreen("student");
          await loadStudentData(u.uid);
        }
      } else {
        setScreen("login");
      }
    });
    return unsub;
  }, []);

  async function loadStudentData(uid) {
    const snap = await getDoc(doc(db, "students", uid));
    if (snap.exists()) {
      const d = snap.data();
      setTasksDone(d.tasksDone || {});
      setCodes(d.codes || {});
    }
  }

  function loadAllStudents() {
    onSnapshot(collection(db, "students"), (snap) => {
      setAllStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }

  async function saveToFirestore(uid, tDone, cds) {
    await setDoc(doc(db, "students", uid), {
      name: user?.displayName || user?.email,
      email: user?.email,
      photo: user?.photoURL || null,
      lastSeen: serverTimestamp(),
      tasksDone: tDone,
      codes: cds,
    }, { merge: true });
  }

  async function handleGoogleLogin() {
    setAuthError("");
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      setAuthError("Ошибка входа: " + e.message);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    setScreen("login");
    setUser(null);
    setRole("student");
    setCodes({});
    setTasksDone({});
    setOutputs({});
    setResults({});
  }

  function runCode(taskId, check) {
    const code = codes[taskId] || "";
    const { output, error } = runPython(code);
    setOutputs(o => ({ ...o, [taskId]: { text: output, error } }));
    if (!error) {
      const passed = check(output);
      setResults(r => ({ ...r, [taskId]: passed }));
      if (passed) {
        const newTD = { ...tasksDone, [taskId]: true };
        setTasksDone(newTD);
        if (user) saveToFirestore(user.uid, newTD, codes);
      }
    }
  }

  function setCode(taskId, val) {
    const newC = { ...codes, [taskId]: val };
    setCodes(newC);
    if (user) saveToFirestore(user.uid, tasksDone, newC);
  }

  function isLabUnlocked(idx) {
    if (idx === 0) return true;
    return LABS[idx - 1].tasks.every(t => tasksDone[t.id]);
  }

  if (authLoading) {
    return <><style>{css}</style><div className="loading">Загрузка...</div></>;
  }

  // ── ВХОД ─────────────────────────────────────────────────────────────────
  if (screen === "login") {
    return (
      <>
        <style>{css}</style>
        <div className="center" style={{ position: "relative", overflow: "hidden" }}>
          <div className="glow" />
          <div className="card">
            <div className="logo">🐍 Python Labs</div>
            <h1 className="title">Добро пожаловать</h1>
            <p className="sub">Войдите через Google чтобы начать лабораторные работы и сохранять прогресс</p>

            <button className="btn btn-google" onClick={handleGoogleLogin}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Войти через Google
            </button>

            {authError && <div className="err-box">{authError}</div>}

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <button onClick={() => setShowTeacherPass(p => !p)}
                style={{ background: "none", border: "none", fontSize: 11, color: C.textMuted, cursor: "pointer", fontFamily: "'Syne', sans-serif" }}>
                Преподаватель
              </button>
            </div>

            {showTeacherPass && (
              <div style={{ marginTop: 12, padding: 16, background: C.card, borderRadius: 10, border: `1px solid ${C.border}` }}>
                <div className="lbl">Пароль преподавателя</div>
                <input className="inp" type="password" placeholder="Введите пароль" value={teacherPass}
                  onChange={e => setTeacherPass(e.target.value)} style={{ marginBottom: 10 }}
                  onKeyDown={e => e.key === "Enter" && (() => {
                    if (teacherPass === "teacher123") { setRole("teacher"); setScreen("teacher"); loadAllStudents(); }
                    else setAuthError("Неверный пароль");
                  })()}
                />
                <button className="btn btn-purple" style={{ marginBottom: 0 }} onClick={() => {
                  if (teacherPass === "teacher123") { setRole("teacher"); setScreen("teacher"); loadAllStudents(); }
                  else setAuthError("Неверный пароль");
                }}>Войти →</button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── ПРЕПОДАВАТЕЛЬ ─────────────────────────────────────────────────────────
  if (screen === "teacher") {
    const total = allStudents.length;
    const active = allStudents.filter(s => {
      if (!s.lastSeen) return false;
      const t = s.lastSeen.toDate ? s.lastSeen.toDate() : new Date(s.lastSeen);
      return Date.now() - t.getTime() < 30 * 60 * 1000;
    }).length;
    const avgPct = total === 0 ? 0 : Math.round(
      allStudents.reduce((sum, s) => sum + Object.values(s.tasksDone || {}).filter(Boolean).length / totalTasks * 100, 0) / total
    );

    return (
      <>
        <style>{css}</style>
        <div className="app">
          <div className="topbar">
            <div className="topbar-logo">🐍 Python Labs — Преподаватель</div>
            <div className="topbar-right">
              {user?.photoURL ? <img src={user.photoURL} className="avatar" alt="" /> : <div className="avatar-txt">П</div>}
              <span className="uname">{user?.displayName || user?.email || "Преподаватель"}</span>
              <button className="btn-sm" onClick={handleLogout}>Выйти</button>
            </div>
          </div>
          <div className="t-wrap">
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Прогресс студентов</h1>
            <p style={{ fontSize: 14, color: C.textSecondary, marginBottom: 28 }}>Данные обновляются в реальном времени</p>
            <div className="stats">
              <div className="stat"><div className="stat-v" style={{ color: C.accentLight }}>{total}</div><div className="stat-l">Студентов</div></div>
              <div className="stat"><div className="stat-v" style={{ color: C.green }}>{active}</div><div className="stat-l">Онлайн (30 мин)</div></div>
              <div className="stat"><div className="stat-v" style={{ color: C.yellow }}>{avgPct}%</div><div className="stat-l">Средний прогресс</div></div>
              <div className="stat"><div className="stat-v">{totalTasks}</div><div className="stat-l">Заданий всего</div></div>
            </div>
            {allStudents.length === 0 && (
              <div style={{ textAlign: "center", padding: 60, color: C.textMuted }}>
                Пока нет студентов. Они появятся здесь после входа через Google.
              </div>
            )}
            {allStudents.map((s, i) => {
              const td = s.tasksDone || {};
              const done = Object.values(td).filter(Boolean).length;
              const pct = Math.round(done / totalTasks * 100);
              const isExp = expandedStudent === i;
              const lastSeenDate = s.lastSeen?.toDate ? s.lastSeen.toDate() : (s.lastSeen ? new Date(s.lastSeen) : null);
              const diff = lastSeenDate ? Math.round((Date.now() - lastSeenDate.getTime()) / 60000) : 999;
              const online = diff < 30;
              return (
                <div className="s-row" key={s.id || i}>
                  <div className="s-head">
                    {s.photo ? <img src={s.photo} className="avatar" alt="" /> : <div className="avatar-txt">{(s.name || "?")[0].toUpperCase()}</div>}
                    <span className="s-name">{s.name || s.email}</span>
                    <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 5, background: online ? C.green+"22" : C.border, color: online ? C.green : C.textMuted }}>
                      {online ? "● онлайн" : lastSeenDate ? (diff < 60 ? `${diff} мин назад` : lastSeenDate.toLocaleDateString("ru-RU")) : "нет данных"}
                    </span>
                    <div className="mbar" style={{ width: 140 }}>
                      <div className="mbar-t"><div className="mbar-f" style={{ width: pct+"%" }} /></div>
                      <div className="pct">{pct}%</div>
                    </div>
                    <button className="exp-btn" onClick={() => setExpandedStudent(isExp ? null : i)}>
                      {isExp ? "Свернуть ▲" : "Подробнее ▼"}
                    </button>
                  </div>
                  <div className="chips">
                    {LABS.map((lab, li) => {
                      const ld = lab.tasks.filter(t => td[t.id]).length;
                      const cl = ld === lab.tasks.length ? "chip ch-d" : ld > 0 ? "chip ch-p" : "chip ch-n";
                      return <span key={li} className={cl}>Лаб {lab.id}: {ld}/{lab.tasks.length}</span>;
                    })}
                  </div>
                  {isExp && (
                    <div style={{ marginTop: 16 }}>
                      {LABS.map((lab, li) => (
                        <div key={li} style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 8 }}>Лаб #{lab.id}: {lab.title}</div>
                          {lab.tasks.map(task => (
                            <div key={task.id} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", marginBottom: 6 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 4, background: td[task.id] ? C.green+"22" : C.border, color: td[task.id] ? C.green : C.textMuted }}>
                                  {td[task.id] ? "✓ Выполнено" : "○ Не выполнено"}
                                </span>
                                <span style={{ fontSize: 12, color: C.textMuted }}>{task.text}</span>
                              </div>
                              {s.codes?.[task.id] && <div className="code-view">{s.codes[task.id]}</div>}
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
      </>
    );
  }

  // ── СТУДЕНТ ───────────────────────────────────────────────────────────────
  const currentLab = LABS[activeLab];
  const doneTasks = Object.keys(tasksDone).filter(k => tasksDone[k]).length;
  const labProgress = currentLab.tasks.filter(t => tasksDone[t.id]).length / currentLab.tasks.length;

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="topbar">
          <div className="topbar-logo">🐍 Python Labs</div>
          <div className="topbar-right">
            <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "JetBrains Mono, monospace" }}>{doneTasks}/{totalTasks}</span>
            {user?.photoURL ? <img src={user.photoURL} className="avatar" alt="" /> : <div className="avatar-txt">{(user?.displayName || "S")[0]}</div>}
            <span className="uname">{user?.displayName?.split(" ")[0] || user?.email}</span>
            <button className="btn-sm" onClick={handleLogout}>Выйти</button>
          </div>
        </div>
        <div className="layout">
          <div className="sidebar">
            <div className="s-title">Лабораторные</div>
            {LABS.map((lab, idx) => {
              const unlocked = isLabUnlocked(idx);
              const done = lab.tasks.every(t => tasksDone[t.id]);
              const active = activeLab === idx;
              return (
                <div key={idx} className={`lab-item ${active ? "active" : ""} ${!unlocked ? "locked" : ""}`} onClick={() => unlocked && setActiveLab(idx)}>
                  <span className="lab-num">{lab.id}</span>
                  <span className="lab-name">{lab.title}</span>
                  <span className={`badge ${done ? "b-done" : !unlocked ? "b-lock" : ""}`}>{done ? "✓" : !unlocked ? "🔒" : ""}</span>
                </div>
              );
            })}
          </div>
          <div className="content">
            <div className="lab-no">Лабораторная работа №{currentLab.id}</div>
            <h2 className="lab-ttl">{currentLab.title}</h2>
            <p className="lab-dsc">{currentLab.description}</p>
            <div className="prog-wrap"><div className="prog-bar" style={{ width: (labProgress * 100)+"%" }} /></div>
            {currentLab.tasks.map((task, ti) => {
              const isDone = tasksDone[task.id];
              const out = outputs[task.id];
              const res = results[task.id];
              const showHint = hints[task.id];
              return (
                <div key={task.id} className={`task ${isDone ? "done" : ""}`}>
                  <div className="task-top">
                    <div className={`task-ico ${isDone ? "ico-done" : "ico-pend"}`}>{isDone ? "✓" : ti + 1}</div>
                    <div className="task-txt">{task.text}</div>
                  </div>
                  {showHint && <div className="hint-box">{task.hint}</div>}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div className="el">Ваш код</div>
                    <div style={{ fontSize: 10, color: C.textMuted, fontFamily: "JetBrains Mono, monospace" }}>вставка запрещена</div>
                  </div>
                  <textarea className="editor" value={codes[task.id] || ""} onChange={e => setCode(task.id, e.target.value)}
                    placeholder="# Напишите ваш Python код здесь..." spellCheck={false}
                    onPaste={e => e.preventDefault()} onDrop={e => e.preventDefault()} onContextMenu={e => e.preventDefault()}
                    onKeyDown={e => {
                      if ((e.ctrlKey || e.metaKey) && e.key === "v") { e.preventDefault(); return; }
                      if (e.key === "Tab") {
                        e.preventDefault();
                        const s = e.target.selectionStart;
                        const v = e.target.value;
                        const nv = v.substring(0, s) + "    " + v.substring(e.target.selectionEnd);
                        setCode(task.id, nv);
                        setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s + 4; }, 0);
                      }
                    }}
                  />
                  <div className="actions">
                    <button className="run-btn" onClick={() => runCode(task.id, task.check)}>▶ Запустить</button>
                    <button className="hint-btn" onClick={() => setHints(h => ({ ...h, [task.id]: !h[task.id] }))}>
                      {showHint ? "Скрыть подсказку" : "Подсказка"}
                    </button>
                    <button className="rst-btn" onClick={() => { setCode(task.id, ""); setOutputs(o => ({...o, [task.id]: null})); setResults(r => ({...r, [task.id]: undefined})); }}>✕</button>
                  </div>
                  {out && (
                    <>
                      <div className="el">Вывод</div>
                      <div className={`out ${out.error ? "err" : res === true ? "ok" : ""}`}>
                        {out.error ? `Ошибка: ${out.error}` : out.text}
                      </div>
                      {!out.error && res !== undefined && (
                        <div className={`res ${res ? "pass" : "fail"}`}>
                          {res ? "✓ Правильно! Задание выполнено." : `✗ Проверьте результат: ${task.checkDesc}`}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
            {currentLab.tasks.every(t => tasksDone[t.id]) && activeLab < LABS.length - 1 && (
              <button className="next-btn" onClick={() => setActiveLab(activeLab + 1)}>Следующая лабораторная →</button>
            )}
            {currentLab.tasks.every(t => tasksDone[t.id]) && activeLab === LABS.length - 1 && (
              <div className="fin">
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.green, marginBottom: 8 }}>Все лабораторные выполнены!</div>
                <div style={{ fontSize: 15, color: C.textSecondary }}>Поздравляем! Вы завершили все задания курса.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
