/* ================= HELPERS ================= */
// Normal CDF approximation (Abramowitz-Stegun)
function phi(z){
  const sign = z < 0 ? -1 : 1;
  z = Math.abs(z) / Math.sqrt(2);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * z);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
  return 0.5 * (1 + sign * y);
}
function factorial(n){ if(n<=1) return 1; let r=1; for(let i=2;i<=n;i++) r*=i; return r; }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function formatNumber(x){ if(isNaN(x)) return "—"; return (Math.round(x*10000)/10000).toString(); }

/* ================= MASTER QUESTION POOL (hard, hints only formulas) ================= */
const pool = [
  {
    id: "Q1",
    title: "Die → Coin hybrid (expected heads)",
    text: "Roll a fair die (1–6). If die shows n, flip a fair coin n times. What is the expected number of heads?",
    hint: "Use law of total expectation: E[H] = E[E[H|N]] and conditional E[H|N=n] = n·p.",
    answer: 1.75
  },
  {
    id: "Q2",
    title: "Bayesian inspection",
    text: "Factory: 70% high-quality, 30% low-quality. P(pass|high)=0.9, P(pass|low)=0.4. If an item passes, what is P(high | pass)?",
    hint: "Use Bayes theorem: P(A|B)=P(B|A)P(A)/P(B).",
    answer: (0.9*0.7)/((0.9*0.7)+(0.4*0.3))
  },
  {
    id: "Q3",
    title: "Conditional expectation of dice sum",
    text: "Throw two fair dice. Let X be the sum. Given X > 7, compute E[X | X>7].",
    hint: "List sums >7 (8..12), compute their probabilities (counts out of 36), then conditional expectation.",
    answer: (8*5 + 9*4 + 10*3 + 11*2 + 12*1) / 15
  },
  {
    id: "Q4",
    title: "Exponential lifetime",
    text: "Bulb lifetime ~ Exponential(mean=1000 hrs). What is P(lifetime > 1200)?",
    hint: "For exponential with mean μ: P(X>t) = exp(-t/μ).",
    answer: Math.exp(-1200/1000)
  },
  {
    id: "Q5",
    title: "Normal interval",
    text: "Apple weights ~ Normal(μ=120g, σ=15g). Find P(100 < X < 130).",
    hint: "Standardize: z = (x - μ)/σ and use Φ(z).",
    answer: null // computed later
  },
  {
    id: "Q6",
    title: "Conditional discrete probability",
    text: "Pick uniformly from 1..20. Given the number is odd, what is P(it is divisible by 3)?",
    hint: "Count odd numbers divisible by 3 among 1..20 and divide by count of odd numbers.",
    answer: 3 / 10
  },
  {
    id: "Q7",
    title: "Poisson email arrivals",
    text: "Emails arrive on average 4 per hour. Find P(exactly 6 arrive in 1 hour).",
    hint: "Poisson: P(X=k)=e^{-λ} λ^k / k! with λ=4, k=6.",
    answer: Math.exp(-4) * Math.pow(4,6) / factorial(6)
  },
  {
    id: "Q8",
    title: "At least one claim",
    text: "Each client files claim with p=0.02/year. For 200 independent clients, what is P(at least one claim)?",
    hint: "Complement rule: P(at least one) = 1 - (1-p)^n.",
    answer: 1 - Math.pow(0.98,200)
  },
  {
    id: "Q9",
    title: "Variance of heads",
    text: "A fair coin is tossed twice. Let X = number of heads. Find Var(X).",
    hint: "Binomial variance: Var = n p (1-p).",
    answer: 2 * 0.5 * 0.5
  },
  {
    id: "Q10",
    title: "Die→coin: probability at least one head",
    text: "(Follow-up to Q1) Using the same die→coin experiment, what is P(at least one head)?",
    hint: "Compute P(H=0) by averaging over N: P(H=0|N=n)=(1/2)^n; then use complement.",
    answer: 1 - (1/6) * ( (1/2)**1 + (1/2)**2 + (1/2)**3 + (1/2)**4 + (1/2)**5 + (1/2)**6 )
  },
  {
    id: "Q11",
    title: "Conditional probability with replacement",
    text: "Box has 3 red & 7 blue balls. You draw one, replace it, then draw again. What is P(both red)?",
    hint: "Replacement ⇒ independent draws. P(both red) = p^2.",
    answer: (3/10) * (3/10)
  },
  {
    id: "Q12",
    title: "Geometric expectation",
    text: "Each trial has success prob p=0.2. Expected number of trials until first success?",
    hint: "Geometric distribution mean = 1/p.",
    answer: 1 / 0.2
  },
  {
    id: "Q13",
    title: "Uniform expected value",
    text: "Random variable ~ Uniform(2,8). What is E[X]?",
    hint: "Uniform mean = (a + b)/2.",
    answer: (2 + 8) / 2
  },
  {
    id: "Q14",
    title: "Binomial probability (medium)",
    text: "n=10, p=0.4. Find P(X=4).",
    hint: "Binomial pmf: C(n,k) p^k (1-p)^{n-k}.",
    answer: (function(){ const n=10,k=4,p=0.4; // compute comb
      function comb(n,r){ let res=1; for(let i=1;i<=r;i++) res=res*(n - r + i)/i; return res; }
      return comb(n,k)*Math.pow(p,k)*Math.pow(1-p,n-k);
    })()
  },
  {
    id: "Q15",
    title: "Exponential waiting",
    text: "Events follow Poisson with rate 5 per minute. What is probability waiting time < 0.2 minutes?",
    hint: "Exponential: P(X < t) = 1 - e^{-λ t}.",
    answer: 1 - Math.exp(-5 * 0.2)
  }
];

/* compute question answers that are derived */
(function computeDerived(){
  const z1 = (100 - 120) / 15;
  const z2 = (130 - 120) / 15;
  // approximate using phi
  pool.forEach(q=>{
    if(q.id === "Q5" || q.title.includes("Normal interval")) {
      // not used; keep
    }
  });
  // now set Q5 (apple weights)
  const q5 = pool.find(q => q.id === "Q5" || q.title.includes("Normal interval"));
  if(q5) q5.answer = phi(z2) - phi(z1);
})();

/* Select 10 random questions from pool (shuffle then slice) */
function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
let questions = shuffle(pool.slice()).slice(0,10); // use 10-random questions

/* ================= DOM refs ================= */
const startBtn = document.getElementById("startBtn");
const setup = document.getElementById("setup");
const game = document.getElementById("game");
const qTitle = document.getElementById("qTitle");
const qText = document.getElementById("qText");
const hintBox = document.getElementById("hintBox");
const showHintBtn = document.getElementById("showHintBtn");
const ansA = document.getElementById("ansA");
const ansB = document.getElementById("ansB");
const ansC = document.getElementById("ansC");
const ansD = document.getElementById("ansD");
const submitBtn = document.getElementById("submitBtn");
const skipBtn = document.getElementById("skipBtn");
const nextBtn = document.getElementById("nextBtn");
const timerEl = document.getElementById("timer");
const roundResult = document.getElementById("roundResult");
const final = document.getElementById("final");
const finalHeading = document.getElementById("finalHeading");
const finalScores = document.getElementById("finalScores");
const confettiCanvas = document.getElementById("confetti");
const restartBtn = document.getElementById("restartBtn");
const leaderA = document.getElementById("scoreA");
const leaderB = document.getElementById("scoreB");
const leaderC = document.getElementById("scoreC");
const leaderD = document.getElementById("scoreD");

/* ================= STATE ================= */
let teamNames = { A: "Team A", B: "Team B", C: "Team C", D: "Team D" };
let scores = { A: 0, B: 0, C: 0, D: 0 };
let current = 0;
let timeLeft = 300;
let timerID = null;
let submitted = false;

/* ========== START GAME ========== */
startBtn.addEventListener("click", () => {
  // reselect random questions each game to avoid stale order
  questions = shuffle(pool.slice()).slice(0,10);

  current = 0;
  scores = { A: 0, B: 0, C: 0, D: 0 };
  submitted = false;
  clearInterval(timerID);

  teamNames.A = (document.getElementById("nameA").value || "Team A").trim();
  teamNames.B = (document.getElementById("nameB").value || "Team B").trim();
  teamNames.C = (document.getElementById("nameC").value || "Team C").trim();
  teamNames.D = (document.getElementById("nameD").value || "Team D").trim();
  document.getElementById("labelA").textContent = teamNames.A;
  document.getElementById("labelB").textContent = teamNames.B;
  document.getElementById("labelC").textContent = teamNames.C;
  document.getElementById("labelD").textContent = teamNames.D;

  setup.classList.add("hidden");
  game.classList.remove("hidden");
  loadQuestion();
});

/* ========== LOAD QUESTION ========== */
function loadQuestion(){
  submitted = false;
  roundResult.classList.add("hidden");
  nextBtn.classList.add("hidden");

  if(current < 0) current = 0;
  if(current >= questions.length){ finishGame(); return; }

  const q = questions[current];
  qTitle.textContent = `${q.title}  (${current+1}/${questions.length})`;
  qText.textContent = q.text;
  hintBox.textContent = q.hint;
  hintBox.classList.add("hidden");
  showHintBtn.style.display = "inline-block";
  ansA.value = ""; ansB.value = ""; ansC.value = ""; ansD.value = "";
  skipBtn.style.display = "inline-block";
  startTimer();
  updateLeaderboardUI();
}

/* ========== TIMER ========== */
function startTimer(){
  clearInterval(timerID);
  timeLeft = 300;
  timerEl.textContent = `⏱ ${timeLeft}s`;
  timerID = setInterval(()=>{
    timeLeft--;
    timerEl.textContent = `⏱ ${timeLeft}s`;
    if(timeLeft <= 0){ clearInterval(timerID); evaluateRound(); }
  },1000);
}
function stopTimer(){ clearInterval(timerID); }

/* ========== SHOW HINT ========== */
showHintBtn.addEventListener("click", ()=>{
  hintBox.classList.remove("hidden");
  showHintBtn.style.display = "none";
});

/* ========== SUBMIT & SKIP (evaluate only) ========== */
submitBtn.addEventListener("click", ()=>{
  if(submitted) return;
  stopTimer();
  evaluateRound();
});
skipBtn.addEventListener("click", ()=>{
  if(submitted) return;
  stopTimer();
  evaluateRound();
});

/* ========== EVALUATE ROUND ========== */
function evaluateRound(){
  submitted = true;
  skipBtn.style.display = "none";

  const q = questions[current];
  const correct = Number(q.answer);
  const inputs = {
    A: parseFloat(ansA.value),
    B: parseFloat(ansB.value),
    C: parseFloat(ansC.value),
    D: parseFloat(ansD.value)
  };

  const details = [];
  ["A","B","C","D"].forEach(t=>{
    const val = inputs[t];
    let pts = 0;
    let errPerc = "—";
    if(!isNaN(val) && isFinite(val)){
      if(Math.abs(correct) < 1e-9){
        const absDiff = Math.abs(val - correct);
        if(absDiff <= 0.01) pts = 10;
        else if(absDiff <= 0.025) pts = 5;
        else pts = 0;
        errPerc = (absDiff).toFixed(4);
      } else {
        errPerc = (Math.abs(val - correct) / Math.abs(correct) * 100);
        if(errPerc <= 10) pts = 10;
        else if(errPerc <= 25) pts = 5;
        else pts = 0;
      }
    } else {
      pts = 0;
    }
    scores[t] += pts;
    details.push({ team: t, name: teamNames[t], given: isNaN(val) ? "—" : Number(val), err: errPerc, pts });
  });

  // show round result
  let html = `<h4>Round result</h4>`;
  html += `<p><strong>Correct value:</strong> ${formatNumber(correct)}</p>`;
  html += `<table><thead><tr><th>Team</th><th>Given</th><th>% error</th><th>Points</th></tr></thead><tbody>`;
  details.forEach(d=>{
    const errText = (d.err === "—") ? "—" : (typeof d.err === "number" ? d.err.toFixed(1) : d.err);
    html += `<tr><td>${escapeHtml(d.name)}</td><td>${d.given}</td><td>${errText}</td><td>${d.pts}</td></tr>`;
  });
  html += `</tbody></table>`;
  roundResult.innerHTML = html;
  roundResult.classList.remove("hidden");

  updateLeaderboardUI();
  nextBtn.textContent = (current === questions.length - 1) ? "Finish ➡" : "Next ➡";
  nextBtn.classList.remove("hidden");
}

/* ========== NEXT / FINISH ========== */
nextBtn.addEventListener("click", ()=>{
  if(current >= questions.length - 1) finishGame();
  else { current++; loadQuestion(); }
});

function finishGame(){
  stopTimer();
  game.classList.add("hidden");
  final.classList.remove("hidden");
  const best = Math.max(scores.A, scores.B, scores.C, scores.D);
  const winners = Object.keys(scores).filter(k => scores[k] === best).map(k => teamNames[k]);
  finalHeading.textContent = winners.length > 1 ? `🏅 Tie: ${winners.join(" & ")} — ${best} pts` : `🏆 Winner: ${winners[0]} — ${best} pts`;
  let html = "<ul>";
  ["A","B","C","D"].forEach(k => { html += `<li><strong>${escapeHtml(teamNames[k])}:</strong> ${scores[k]} pts</li>`; });
  html += "</ul>";
  finalScores.innerHTML = html;
  launchConfetti();
}

/* ========== LEADERBOARD UI ========== */
function updateLeaderboardUI(){
  leaderA.textContent = `${teamNames.A}: ${scores.A}`;
  leaderB.textContent = `${teamNames.B}: ${scores.B}`;
  leaderC.textContent = `${teamNames.C}: ${scores.C}`;
  leaderD.textContent = `${teamNames.D}: ${scores.D}`;
}

/* ========== CONFETTI ========== */
function launchConfetti(){
  const canvas = confettiCanvas;
  const ctx = canvas.getContext("2d");
  canvas.width = canvas.offsetWidth;
  canvas.height = 240;
  const pieces = [];
  const colors = ["#ff6a00","#ee0979","#66a6ff","#00d4ff","#ffd166"];
  for(let i=0;i<200;i++){
    pieces.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height - canvas.height,
      w: 6 + Math.random()*8,
      h: 6 + Math.random()*8,
      color: colors[Math.floor(Math.random()*colors.length)],
      vx: -1 + Math.random()*2,
      vy: 2 + Math.random()*4,
      rot: Math.random()*360
    });
  }
  function step(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p=>{
      p.x += p.vx; p.y += p.vy; p.rot += 6;
      if(p.y > canvas.height){ p.y = -10; p.x = Math.random()*canvas.width; }
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      ctx.restore();
    });
    requestAnimationFrame(step);
  }
  step();
}

/* ========== RESTART ========== */
restartBtn.addEventListener("click", ()=> location.reload());
