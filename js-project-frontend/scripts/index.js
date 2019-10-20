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
function requestQuiz(topicIdsArray, numberOfQuestions) {
  const topicIds = topicIdsArray.join(',');
  const questionIndexRequest = {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify( { topicIds: topicIds, numberOfQuestions: numberOfQuestions} )
  };

  return fetch(`${BASE_URL}/quizzes/`, questionIndexRequest)
    .then((response) => response.json())
    .then((json) => quiz = json.quiz);
}

function buildOOQuiz(questionObjectArray) {
  const questionInstanceArray = [];
  let index = 1;
  for (const question of questionObjectArray) {
    questionInstanceArray.push(new Question(question, index));
    index++;
  }

  return new Quiz(questionInstanceArray);
}

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

// User Functions
function login(username, password) {
  const newSessionRequest = {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify( { username: username, password: password } )
  };

  return fetch(`${BASE_URL}/sessions/`, newSessionRequest)
    .then((response) => response.json())
    .then((json) => { console.log(json);
      userId = json.id;
      currentUser = json.username})
    .then(() => displayMainMenu());
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

// Display / DOM interaction (View)
function buildQuestionDiv() {
  document.querySelector("#content-div").innerHTML = "";

  newHTML("div", "question");
  newHTML("h1", "question-number", "#question");
  newHTML("h3", "stem", "#question");
  const choice1 = newHTML("h3", "choice1", "#question")
  choice1.className = "choice";
  const choice2 = newHTML("h3", "choice2", "#question")
  choice2.className = "choice";
  const choice3 = newHTML("h3", "choice3", "#question")
  choice3.className = "choice";
  const choice4 = newHTML("h3", "choice4", "#question")
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
  if (topicIdList == []) { // select all topics if none were checked
    for (input of inputs) {
      topicIdList.push(parseInt(input.id.slice(5)))
    }
  }
  return topicIdList;
}

function getNumberofQuestions() {
  return parseInt(document.querySelector("#num-questions").value);
}

function getAndAdministerQuiz() {
  const selectedTopics = getTopicList();
  const numberOfQuestions = getNumberofQuestions();
  buildQuestionDiv();
  requestQuiz(selectedTopics, numberOfQuestions)
    .then((questionArray) => buildOOQuiz(questionArray))
    .then((ooQuizResult) => quiz = ooQuizResult)
    .then(() => quiz.askQuestion());
}

function displayMainMenu() {
  document.querySelector("#content-div").innerText = "";

  const welcome = newHTML("h1", "welcome");
  welcome.innerText = "Welcome to another Quiz App!";

  const likeTo = newHTML("h3", "like-to");
  likeTo.innerText = "Would you like to...";

  const quizButton = newHTML("button", "quiz-button");
  quizButton.innerText = "Take a Quiz";

  const statsButton = newHTML("button", "stats-button");
  statsButton.innerText = "See Your Topic Stats";

  const logoutButton = newHTML("button", "logout-button");
  logoutButton.innerText = "Logout";
}

function showLogin() {
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
}

function quizEndMessage(message) {
  m = newHTML("h1", "quiz-message");
  m.innerText = message;

  backButton = newHTML("button", "back-to-main");
  backButton.innerText = "Back to Main Menu";
}

// Program flow
function setUpQuiz() {
  getAllTopics()
  .then(() => displayTopicList());
}
  // Prompt for Username

// Log In User
showLogin();
// displayMainMenu(); is called at end of login()
// Display Topics to Select From

// get user input for topic selection and get and administer quiz
// getAndAdministerQuiz() driven by event listener response to topic selection

// set up Event Listener to process question responses
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
  }
})
