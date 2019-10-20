// Global Constants:
const BASE_URL = "http://localhost:3000";

// Global (Window) Variables:
let quiz;
let userId;
let currentUser;
let topics = [];

// Classes (Model)
class Topic {
  constructor(id, name) {
    this._id = id;
    this._name = name;
  }

  get id() { return this._id  }
  get name() { return this._name }
}

class Question {
  constructor(questionObject, questionNumber) {
    this._id = questionObject.id;
    this._topicId = questionObject.topic_id;
    this._stem = questionObject.stem;
    this._choices = [questionObject.choice_1, questionObject.choice_2,
      questionObject.choice_3, questionObject.choice_4];
    this._correctChoice = questionObject.correct_choice;
    this._choiceSelected = 0;
    this._questionNumber = questionNumber;
  }

  get id() { return this._id; }
  get topicId() { return this._topicId; }
  get stem() { return this._stem; }
  get choices() { return this._choices; }
  get correctChoice() { return this._correctChoice }
  get choiceSelected() { return this._choiceSelected }
  get questionNumber() { return this._questionNumber }

  set choiceSelected(choice) {
    this._choiceSelected = choice;
  }

  answeredCorrectly() {
    return this._choiceSelected == this._correctChoice ? true : false;
  }
}

class Quiz {
  constructor(questionArray) {
    this._questions = questionArray;
    this._currentQuestionIndex = 0;
    this._numberCorrect = 0;
  }

  get questions() { return this._questions }

  askQuestion() {
    let numberCorrect = 0;
    const question = this.questions[this._currentQuestionIndex];
    displayQuestion(question);
  }

  respondToSelection(selection) {
    const question = this.questions[this._currentQuestionIndex];
    question.choiceSelected = selection;
    if(question.answeredCorrectly()) {
      this._numberCorrect++;
    }
    this._currentQuestionIndex++;
    if(!this.complete()) {
      this.askQuestion();
    } else {
      quizEndMessage(`Quiz complete. ${this._numberCorrect} out of ${this.questions.length} correct.`);
      this.storeQuizResults();
    }
  }

  storeQuizResults() {
    const questionResults = [];
    for (const question of this.questions) {
      questionResults.push( {'id': question.id, 'choice': question.choiceSelected} );
    }
    const body = { "userId": userId, 'questions': questionResults };

    const encounterRequest = {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify(body)
    };

    fetch(`${BASE_URL}/encounters/`, encounterRequest)
      .then((response) => response.json());
  }

  complete() {
    return this._currentQuestionIndex == this.questions.length ? true : false;
  }
}

// Interface Methods (Controller)
// Quiz Functions
// requestQuiz takes topicIdsArray and numberOfQuestions and then builds and
// sends a fetch request to get a list of quiz questions from the API.

// Topic Functions
function deleteTopic(topicId) {
  const topicDeleteRequest = {
    method: 'DELETE',
    headers: { 'Content-type': 'application/json' },
  }

  fetch(`${BASE_URL}/topics/${topicId}`, topicDeleteRequest)
    .then((response) => response.json())
    .then((json) => console.log(json));
}

function createNewTopic(topicName) {
  const newTopicRequest = {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({
      topic_name: "Physics"
    })
  }

  fetch(`${BASE_URL}/topics`, newTopicRequest)
    .then((response) => response.json())
    .then((json) => console.log(json));
}

function getAllTopics() {
  topics = [];
  return fetch(`${BASE_URL}/topics`)
    .then((response) => response.json())
    .then((json) => json.forEach((topic) => {
      topics.push(new Topic(topic.id, topic.name))
    }));
}

// Quiz Functions
function getAndAdministerQuiz() {
  const selectedTopics = getTopicList();
  const numberOfQuestions = getNumberofQuestions();
  buildQuestionDiv();
  requestQuiz(selectedTopics, numberOfQuestions)
    .then((questionArray) => quiz = instantiateQuiz(questionArray))
    .then(() => quiz.askQuestion());
}

function requestQuiz(topicIdsArray, numberOfQuestions) {
  const topicIds = topicIdsArray.join(',');
  const questionIndexRequest = {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify( { topicIds: topicIds, numberOfQuestions: numberOfQuestions} )
  };

  return fetch(`${BASE_URL}/quizzes/`, questionIndexRequest)
    .then((response) => response.json())
    .then((json) => questionArray = json.quiz);
}

function instantiateQuiz(questionObjectArray) {
  const questionInstanceArray = [];
  let index = 1;
  for (const question of questionObjectArray) {
    questionInstanceArray.push(new Question(question, index));
    index++;
  }

  return new Quiz(questionInstanceArray);
}

// User Functions
function login(username, password) {
  const newSessionRequest = {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify( { username: username, password: password } )
  };

  return fetch(`${BASE_URL}/sessions/`, newSessionRequest)
    .then((response) => response.json())
    .then((json) => {
      userId = json.id;
      currentUser = json.username;
      displayMainMenu(json.message)});
}

function logout() {
  const newSessionRequest = {
    method: 'DELETE',
    headers: { 'Content-type': 'application/json' }
  };

  return fetch(`${BASE_URL}/sessions/${userId}`, newSessionRequest)
    .then((response) => response.json())
    .then((json) => console.log(json))
    .then(() => userId = undefined)
    .then(() => showLogin());
}

function createUser(username, password) {
  const newUserRequest = {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({
      username: username, password: password
    })
  }

  fetch(`${BASE_URL}/users`, newUserRequest)
    .then((response) => response.json())
    .then((json) => {
      showLogin();
      msg = newHTML("h1", "new-user-message")
      msg.innerText = json.message;
    });
}

function newUserPage() {
  clearContentDiv();

  welcome = newHTML("h1", "welcome");
  welcome.innerText = "Welcome to another Quiz App!"

  inst = newHTML("h3", "instructions");
  inst.innerText = "Please enter your desired username and password";

  uname = newHTML("input", "username");
  uname.type = "textBox";
  uname.value = "username";

  newHTML("br", "br1");

  password = newHTML("input", "password");
  password.type = "password";
  password.value = "password"

  newHTML("br", "br2");

  submitCredsButton = newHTML("button", "create-user-button");
  submitCredsButton.innerText = "Create User";
}

// Helper Functions
function newHTML(tag, id, parentId = "#content-div") {
  const temp = document.createElement(tag);
  temp.id = id;
  document.querySelector("#content-div").appendChild(temp);
  return temp;
}

function clearContentDiv() {
  document.querySelector("#content-div").innerText = "";
}

function newTextInput(id, labelText, parentId = "#content.div") {
  newHTML("br", "break");
  label = newHTML("label", `${id}-label`, parentId);
  label.innerText = labelText;
  text = newHTML("input", id, parentId);
  text.type = "textBox";
  label.setAttribute("for", id);
}

// Display / DOM interaction (View)
function buildQuestionDiv() {
  document.querySelector("#content-div").innerHTML = "";

  newHTML("h1", "question-number");
  newHTML("h3", "stem");
  const choice1 = newHTML("h3", "choice1")
  choice1.className = "choice";
  const choice2 = newHTML("h3", "choice2")
  choice2.className = "choice";
  const choice3 = newHTML("h3", "choice3")
  choice3.className = "choice";
  const choice4 = newHTML("h3", "choice4")
  choice4.className = "choice";
}

function displayQuestion(question) {
  document.querySelector("#question-number").innerText = `Question #${question.questionNumber}`;
  document.querySelector("#stem").innerText = question.stem;
  document.querySelector("#choice1").innerText = `A. ${question.choices[0]}`;
  document.querySelector("#choice2").innerText = `B. ${question.choices[1]}`;
  document.querySelector("#choice3").innerText = `C. ${question.choices[2]}`;
  document.querySelector("#choice4").innerText = `D. ${question.choices[3]}`;
}

function displayTopicList() {
  clearContentDiv();

  const inst1 = newHTML("h2", "inst1");
  inst1.innerText = "Please select your quiz topics and the number of questions you'd like to answer...";

  const inst2 = newHTML("h3", "inst2");
  inst2.innerText = "If you do not select any topics, all topics will be included.";

  const ul = newHTML("ul", "list");

  for (const topic of topics) {
    const li = document.createElement("li");
    li.innerText = topic.name;
    ul.appendChild(li);
    const ck = document.createElement('input');
    ck.type = "checkbox";
    ck.id = `topic${topic.id}`
    li.appendChild(ck);
  }

  const p = newHTML("p", "label")
  p.innerText = "Number of Questions:";
  const num = newHTML("input", "num-questions");
  num.type = "textbox";
  num.value = "5";

  const button = newHTML("button", "make-quiz")
  button.innerText = "Create Quiz";
}

function getTopicList() {
  const topicIdList = [];
  const inputs = document.querySelectorAll("input");
  for (input of inputs) {
    if(input.type == "checkbox" && input.checked) {
      topicIdList.push(parseInt(input.id.slice(5)))
    }
  }
  if (topicIdList.length == 0) { // select all topics if none were checked
    for (input of inputs) {
      if(input.type == "checkbox") {
        topicIdList.push(parseInt(input.id.slice(5)))
      }
    }
  }
  return topicIdList;
}

function getNumberofQuestions() {
  return parseInt(document.querySelector("#num-questions").value);
}

function getAndDisplayStats() {
  getStats()
    .then((stats) => displayStats(stats.message));
}

function displayStats(stats) {
  clearContentDiv();

  const title = newHTML("h1", "title");
  title.innerText = `Question Performance Statistics for ${currentUser}:`

  const list = newHTML("ul", "list");

  for (const stat_topic in stats) {
    topic_stats = newHTML("li", `${stat_topic.toLowerCase()}-stats`, list)
    correct = stats[`${stat_topic}`]["number_correct"];
    possible = stats[`${stat_topic}`]["number_possible"];
    percentage = ((correct / possible) * 100).toFixed(1);
    topic_stats.innerText =
      `${stat_topic}: ${correct} out of a possible ${possible} = ${percentage}%`
  }

  backButton = newHTML("button", "back-to-main");
  backButton.innerText = "Back to Main Menu";
}

function getStats() {
  return fetch(`${BASE_URL}/encounters/${parseInt(userId)}`)
    .then((response) => response.json());
}

function displayMainMenu(message) {
  if(userId) {
    clearContentDiv();;

    const welcome = newHTML("h1", "welcome");
    welcome.innerText = "Generic Quiz App";

    const likeTo = newHTML("h3", "like-to");
    likeTo.innerText = "Would you like to...";

    const quizButton = newHTML("button", "quiz-button");
    quizButton.innerText = "Take a Quiz";

    const statsButton = newHTML("button", "stats-button");
    statsButton.innerText = "See Your Topic Stats";

    const newQuestionButton = newHTML("button", "new-question-button");
    newQuestionButton.innerText = "Create a new Question";

    const logoutButton = newHTML("button", "logout-button");
    logoutButton.innerText = "Logout";
  } else {
    showLogin(message);
  }
}

function showLogin(loginErrorMessage = "") {
  clearContentDiv();

  welcome = newHTML("h1", "welcome");
  welcome.innerText = "Welcome to another Quiz App!"

  inst = newHTML("h3", "instructions");
  inst.innerText = "Please enter your username and password or create a new account";

  uname = newHTML("input", "username");
  uname.type = "textBox";
  uname.value = "username";

  newHTML("br", "br1");

  password = newHTML("input", "password");
  password.type = "password";
  password.value = "password"

  newHTML("br", "br2");

  submitCredsButton = newHTML("button", "login-button");
  submitCredsButton.innerText = "Log In";

  newUserButton = newHTML("button", "new-user-button");
  newUserButton.innerText = "New User";

  errorMessage = newHTML("h3", "error-message");
  errorMessage.innerText = loginErrorMessage;
}

function quizEndMessage(message) {
  m = newHTML("h1", "quiz-message");
  m.innerText = message;

  backButton = newHTML("button", "back-to-main");
  backButton.innerText = "Back to Main Menu";
}

function newQuestionForm() {
  clearContentDiv();

  title = newHTML("h1", "title");
  title.innerText = "Create a New Question:";

  newTextInput("question-stem", "Question Stem: ");
  newTextInput("distractor-1", "Choice 1: ");
  newTextInput("distractor-2", "Choice 2: ");
  newTextInput("distractor-3", "Choice 3: ");
  newTextInput("distractor-4", "Choice 4: ");

  inst1 = newHTML("p", "correct-choice");
  inst1.innerText = "Correct Answer:"

  for (let i = 1; i <=4; i++) {
    console.log(i);

    newHTML("br", "break");
    const label = newHTML("label", `radio-button-label-${i}`);
    label.innerText = `Choice ${i} `;
    const choice = newHTML("input", `radio-button-${i}`);
    choice.type = "radio";
    choice.setAttribute("name", "answer-choice");
    label.setAttribute("for", `radio-button-${i}`);
  }

  newHTML("br", "break");

  btn = newHTML("button", "create-question-button");
  btn.innerText = "Create New Question";
}

function listeners() {
  document.addEventListener("click", (e) => {
    const id = e.target.id;
    if (e.target.className == "choice") {
      choice = id;
      quiz.respondToSelection(choice[choice.length - 1]);
    } else if (id == "make-quiz") {
      getAndAdministerQuiz();
    } else if (id == "quiz-button") {
      setUpQuiz();
    } else if (id == "logout-button") {
      logout();
    } else if (id == "login-button") {
      login(document.querySelector("#username").value,
        document.querySelector("#password").value);
    } else if (id == "back-to-main") {
      displayMainMenu();
    } else if (id == "new-user-button") {
      newUserPage();
    } else if (id == "create-user-button") {
      createUser(document.querySelector("#username").value,
        document.querySelector("#password").value);
    } else if (id == "stats-button") {
      getAndDisplayStats();
    } else if (id == "new-question-button") {
      newQuestionForm();
    }
  })

  document.addEventListener("keydown", (e) => {
    if(e.keyCode === 13 && !!document.querySelector("#login-button")) {
      login(document.querySelector("#username").value,
        document.querySelector("#password").value);
    } else if ((e.keyCode === 65 || e.keyCode === 49) && !!document.querySelector("#stem")) {
      quiz.respondToSelection(1);
    } else if ((e.keyCode === 66 || e.keyCode === 50) && !!document.querySelector("#stem")) {
      quiz.respondToSelection(2);
    } else if ((e.keyCode === 67 || e.keyCode === 51) && !!document.querySelector("#stem")) {
      quiz.respondToSelection(3);
    } else if ((e.keyCode === 68 || e.keyCode === 52) && !!document.querySelector("#stem")) {
      quiz.respondToSelection(4);
    }
  })
}

// Program flow
function setUpQuiz() {
  getAllTopics()
  .then(() => displayTopicList());
}
  // Prompt for Username

listeners();
// Log In User
// showLogin();
login("btate712", "temp");
displayMainMenu();
// displayMainMenu() is called at end of login()
