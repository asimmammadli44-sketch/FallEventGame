let gameMode = "1P"; // '1P' or '2P'
let p1Score = 0;
let p2Score = 0;
let timeLeft = 20; // 20-second timer requirement
let timerInterval = null;
let isGameActive = false;

let p1Name = "Player 1";
let p2Name = "Bot";

// 2P Pass-and-Play State variables
let p1TempChoice = null;
let duoTurnState = 1; // 1 = Player 1 picking, 2 = Player 2 picking

let leaderboard = JSON.parse(localStorage.getItem("adaFallLeaderboard")) || [];
updateLeaderboardUI();

function setMode(mode) {
  if (isGameActive) return;
  gameMode = mode;

  document.getElementById("mode-1p").classList.toggle("active", mode === "1P");
  document.getElementById("mode-2p").classList.toggle("active", mode === "2P");

  document.getElementById("setup-1p").classList.toggle("hidden", mode !== "1P");
  document.getElementById("setup-2p").classList.toggle("hidden", mode !== "2P");

  document.getElementById("p1-board-label").textContent = "Player 1";
  document.getElementById("p2-board-label").textContent =
    mode === "1P" ? "Bot" : "Player 2";
  document.getElementById("p1-score").textContent = "0";
  document.getElementById("p2-score").textContent = "0";
  document.getElementById("timer-display").textContent = "20s";

  const msg = document.getElementById("result-message");
  msg.style.color = "#5c2c0c";
  msg.textContent =
    mode === "1P"
      ? "Enter name and click Start 20s!"
      : "Friends enter names & tap Battle! (Pass phone securely)";
}

function startGame() {
  if (gameMode === "1P") {
    const name = document.getElementById("p1-name-solo").value.trim();
    if (!name) return alert("Please enter the student's name!");
    p1Name = name;
    p2Name = "Bot";
  } else {
    const name1 = document.getElementById("p1-name-duo").value.trim();
    const name2 = document.getElementById("p2-name-duo").value.trim();
    if (!name1 || !name2) return alert("Please enter BOTH players' names!");
    p1Name = name1;
    p2Name = name2;
  }

  p1Score = 0;
  p2Score = 0;
  timeLeft = 20; // 20s countdown
  isGameActive = true;
  duoTurnState = 1;
  p1TempChoice = null;

  document.getElementById("p1-board-label").textContent = p1Name;
  document.getElementById("p2-board-label").textContent = p2Name;
  document.getElementById("p1-score").textContent = "0";
  document.getElementById("p2-score").textContent = "0";
  document.getElementById("timer-display").textContent = "20s";
  document.getElementById("timer-display").style.color = "#d96b27";

  setInputsDisabled(true);
  toggleButtons(true);
  document.getElementById("pass-screen").classList.add("hidden");

  const msg = document.getElementById("result-message");
  msg.style.color = "#5c2c0c";
  msg.textContent =
    gameMode === "1P"
      ? `Go, ${p1Name}! Tap fast!`
      : `${p1Name}'s Turn: Tap your secret choice!`;

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    const timerDisplay = document.getElementById("timer-display");
    timerDisplay.textContent = timeLeft + "s";

    if (timeLeft <= 5 && timeLeft > 0) {
      timerDisplay.style.color = "#b71c1c";
      triggerAnim(timerDisplay, "pop-anim");
    }

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// Universal tap handler for emoji buttons
function makeChoice(choice) {
  if (!isGameActive) return;

  if (gameMode === "1P") {
    playSoloRound(choice);
  } else {
    playDuoRound(choice);
  }
}

function playSoloRound(playerChoice) {
  const choices = ["rock", "paper", "scissors"];
  const botChoice = choices[Math.floor(Math.random() * 3)];
  const winner = getWinner(playerChoice, botChoice);
  const msg = document.getElementById("result-message");

  const pEmoji = getEmoji(playerChoice);
  const bEmoji = getEmoji(botChoice);

  if (winner === "draw") {
    msg.textContent = `Draw! Both picked ${pEmoji}.`;
    msg.style.color = "#d9822b";
  } else if (winner === "p1") {
    p1Score++;
    const scoreEl = document.getElementById("p1-score");
    scoreEl.textContent = p1Score;
    triggerAnim(scoreEl, "pop-anim");
    msg.textContent = `Win! ${pEmoji} beats ${bEmoji} (+1)`;
    msg.style.color = "#2e7d32";
  } else {
    p2Score++;
    document.getElementById("p2-score").textContent = p2Score;
    msg.textContent = `Loss! ${bEmoji} beats ${pEmoji}.`;
    msg.style.color = "#b71c1c";
  }
}

function playDuoRound(playerChoice) {
  const msg = document.getElementById("result-message");

  if (duoTurnState === 1) {
    // Player 1 has locked in their choice in secret
    p1TempChoice = playerChoice;
    duoTurnState = 2;

    // Hide buttons temporarily and show pass screen so P2 can take over safely
    toggleButtons(false);
    document.getElementById("pass-title").textContent =
      `Pass phone to ${p2Name}!`;
    document.getElementById("pass-screen").classList.remove("hidden");
    msg.textContent = `${p1Name} locked in! Pass phone...`;
  } else {
    // Player 2 has made their choice
    const p2Choice = playerChoice;
    const winner = getWinner(p1TempChoice, p2Choice);

    const e1 = getEmoji(p1TempChoice);
    const e2 = getEmoji(p2Choice);

    if (winner === "draw") {
      msg.textContent = `Draw! Both picked ${e1}.`;
      msg.style.color = "#d9822b";
    } else if (winner === "p1") {
      p1Score++;
      const scoreEl = document.getElementById("p1-score");
      scoreEl.textContent = p1Score;
      triggerAnim(scoreEl, "pop-anim");
      msg.textContent = `Point for ${p1Name}! (${e1} beats ${e2})`;
      msg.style.color = "#2e7d32";
    } else {
      p2Score++;
      const scoreEl = document.getElementById("p2-score");
      scoreEl.textContent = p2Score;
      triggerAnim(scoreEl, "pop-anim");
      msg.textContent = `Point for ${p2Name}! (${e2} beats ${e1})`;
      msg.style.color = "#2e7d32";
    }

    // Reset for the next rapid round clash
    duoTurnState = 1;
    p1TempChoice = null;
    if (isGameActive) {
      msg.textContent += ` | Next round: ${p1Name}'s turn!`;
    }
  }
}

function resume2P() {
  document.getElementById("pass-screen").classList.add("hidden");
  toggleButtons(true);
  document.getElementById("result-message").textContent =
    `${p2Name}'s Turn: Tap your secret choice!`;
}

function endGame() {
  clearInterval(timerInterval);
  isGameActive = false;

  toggleButtons(false);
  setInputsDisabled(false);
  document.getElementById("pass-screen").classList.add("hidden");

  const msg = document.getElementById("result-message");
  msg.style.color = "#5c2c0c";

  if (gameMode === "1P") {
    msg.textContent = `⏰ Time's up! ${p1Name} scored ${p1Score} pts!`;
    saveScore(p1Name, p1Score);
    document.getElementById("p1-name-solo").value = "";
  } else {
    if (p1Score > p2Score) {
      msg.textContent = `🏆 ${p1Name} wins the 20s battle (${p1Score} - ${p2Score})!`;
    } else if (p2Score > p1Score) {
      msg.textContent = `🏆 ${p2Name} wins the 20s battle (${p2Score} - ${p1Score})!`;
    } else {
      msg.textContent = `🤝 Tie battle! Both scored ${p1Score} pts!`;
    }
    saveScore(p1Name, p1Score);
    saveScore(p2Name, p2Score);
    document.getElementById("p1-name-duo").value = "";
    document.getElementById("p2-name-duo").value = "";
  }

  updateLeaderboardUI();
}

function saveScore(name, score) {
  leaderboard.push({ name: name, score: score });
  leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem("adaFallLeaderboard", JSON.stringify(leaderboard));
}

function getWinner(c1, c2) {
  if (c1 === c2) return "draw";
  if (
    (c1 === "rock" && c2 === "scissors") ||
    (c1 === "scissors" && c2 === "paper") ||
    (c1 === "paper" && c2 === "rock")
  ) {
    return "p1";
  }
  return "p2";
}

function getEmoji(choice) {
  if (choice === "rock") return "✊";
  if (choice === "paper") return "✋";
  return "✌️";
}

function updateLeaderboardUI() {
  const list = document.getElementById("leaderboard-list");
  list.innerHTML = "";

  if (leaderboard.length === 0) {
    list.innerHTML = `<li style="justify-content: center; color: #8b4513;">No players yet. Be the first!</li>`;
    return;
  }

  leaderboard.forEach((entry, index) => {
    const li = document.createElement("li");
    let rankBadge = `#${index + 1}`;
    if (index === 0) rankBadge = "🥇";
    else if (index === 1) rankBadge = "🥈";
    else if (index === 2) rankBadge = "🥉";

    li.innerHTML = `
            <span>${rankBadge} ${entry.name}</span>
            <span class="player-pts">${entry.score} pts</span>
        `;
    list.appendChild(li);
  });
}

function toggleButtons(enable) {
  const buttons = document.querySelectorAll(".choices .choice-btn");
  buttons.forEach((btn) => (btn.disabled = !enable));
}

function setInputsDisabled(disabled) {
  document.getElementById("p1-name-solo").disabled = disabled;
  document.getElementById("p1-name-duo").disabled = disabled;
  document.getElementById("p2-name-duo").disabled = disabled;
  document.getElementById("mode-1p").disabled = disabled;
  document.getElementById("mode-2p").disabled = disabled;
  document
    .querySelectorAll(".start-btn")
    .forEach((btn) => (btn.disabled = disabled));
}

function triggerAnim(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

function clearLeaderboard() {
  if (confirm("Are you sure you want to clear all event scores?")) {
    leaderboard = [];
    localStorage.removeItem("adaFallLeaderboard");
    updateLeaderboardUI();
  }
}
