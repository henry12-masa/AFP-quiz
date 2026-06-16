const params = new URLSearchParams(location.search);
const type = params.get("type") || "all";
const QUESTION_LIMIT = 50;

const quizInfo = {
  cfp: { title: "CFP®（Certified Financial Planner）", desc: "上級FP倫理、ライフプラン、リスク、金融、タックス、不動産、相続・事業承継" },
  afp: { title: "AFP", desc: "FP基礎、顧客対応、提案書、ライフプラン、金融、保険、税金、不動産、相続" },
  cma: { title: "証券アナリスト（CMA）", desc: "証券分析、ポートフォリオ、財務分析、経済、デリバティブ、職業倫理" },
  securities1: { title: "証券外務員一種", desc: "株式、債券、投信、信用取引、デリバティブ、法令諸規則、顧客管理" },
  securities2: { title: "証券外務員二種", desc: "金融商品取引法、協会規則、株式、債券、投資信託、顧客対応" },
  lifeInsurance: { title: "生命保険募集人", desc: "生命保険の基礎、告知、契約、保険種類、コンプライアンス、顧客説明" },
  nonlifeInsurance: { title: "損害保険募集人", desc: "自動車、火災、傷害、賠償責任、募集ルール、重要事項説明" },
  dcPlanner: { title: "DCプランナー", desc: "確定拠出年金、企業年金、投資教育、老後資金、制度運営、資産運用" },
  pensionAdvisor: { title: "年金アドバイザー", desc: "公的年金、老齢・障害・遺族給付、在職老齢年金、請求手続、年金相談" }
};

const pageTitle = document.getElementById("pageTitle");
const pageDesc = document.getElementById("pageDesc");
const quizList = document.getElementById("quizList");

if (type === "all") {
  document.title = "金融・保険・年金資格クイズ";
  pageTitle.textContent = "金融・保険・年金資格クイズ";
  pageDesc.textContent = "9カテゴリ・各180問から50問ランダムで出題";
} else {
  const info = quizInfo[type] || quizInfo.cfp;
  document.title = info.title;
  pageTitle.textContent = info.title;
  pageDesc.textContent = info.desc;
}

quizList.innerHTML = `
  <a href="index.html" class="${type === "all" ? "active" : ""}">全カテゴリ50問</a>
  ${Object.keys(quizInfo).map(key => `
    <a href="?type=${key}" class="${type === key ? "active" : ""}">${quizInfo[key].title}</a>
  `).join("")}
`;

function normalizeQuestion(q){
  return { question: q.question || q.q, choices: q.choices || q.c, answer: q.answer || q.a, explanation: q.explanation || q.e || "" };
}
function shuffle(array){ return array.map(v => [Math.random(), v]).sort((a,b) => a[0] - b[0]).map(v => v[1]); }
function uniqueByQuestion(array){
  const seen = new Set();
  return array.filter(q => {
    const key = (q.question || q.q || "").trim();
    if (!key || seen.has(key)) return false;
    seen.add(key); return true;
  });
}
let questions = [];
if (type === "all") {
  Object.keys(quizInfo).forEach(key => { if (window.quizData && Array.isArray(window.quizData[key])) questions.push(...window.quizData[key].map(normalizeQuestion)); });
} else { questions = window.quizData?.[type] ? window.quizData[type].map(normalizeQuestion) : []; }
questions = shuffle(uniqueByQuestion(questions)).slice(0, QUESTION_LIMIT);
let currentIndex = 0, score = 0, answered = false;
const counter = document.getElementById("counter"), scoreEl = document.getElementById("score"), questionEl = document.getElementById("question"), choicesEl = document.getElementById("choices"), resultEl = document.getElementById("result"), nextBtn = document.getElementById("nextBtn"), progressBar = document.getElementById("progressBar");
function showQuestion() {
  answered = false; resultEl.textContent = ""; nextBtn.style.display = "none";
  if (questions.length === 0) { questionEl.textContent = "問題データが読み込めませんでした"; choicesEl.innerHTML = ""; counter.textContent = "0 / 0"; scoreEl.textContent = "スコア: 0"; progressBar.style.width = "0%"; return; }
  if (currentIndex >= questions.length) { questionEl.textContent = "終了！"; choicesEl.innerHTML = ""; counter.textContent = `${questions.length} / ${questions.length}`; scoreEl.textContent = `スコア: ${score}`; resultEl.textContent = `${questions.length}問中 ${score}問正解`; progressBar.style.width = "100%"; return; }
  const q = questions[currentIndex]; counter.textContent = `${currentIndex + 1} / ${questions.length}`; scoreEl.textContent = `スコア: ${score}`; questionEl.textContent = q.question; progressBar.style.width = `${((currentIndex + 1) / questions.length) * 100}%`; choicesEl.innerHTML = "";
  shuffle(q.choices).forEach(choice => {
    const btn = document.createElement("button"); btn.textContent = choice;
    btn.onclick = () => {
      if (answered) return; answered = true;
      if (choice === q.answer) { score++; resultEl.textContent = "正解！"; btn.classList.add("correct"); } else { resultEl.textContent = `不正解。正解は「${q.answer}」`; btn.classList.add("wrong"); }
      [...choicesEl.children].forEach(b => { b.disabled = true; if (b.textContent === q.answer) b.classList.add("correct"); });
      if (q.explanation) resultEl.textContent += ` ${q.explanation}`; scoreEl.textContent = `スコア: ${score}`;
      setTimeout(() => { currentIndex++; showQuestion(); }, 900);
    };
    choicesEl.appendChild(btn);
  });
}
nextBtn.onclick = () => { currentIndex++; showQuestion(); };
showQuestion();
