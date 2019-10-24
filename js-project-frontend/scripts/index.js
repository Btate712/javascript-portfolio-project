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
    View.displayQuestion(question);
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
      View.quizEndMessage(`Quiz complete. ${this._numberCorrect} out of ${this.questions.length} correct.`);
      this.storeQuizResults();
    }
  }

  storeQuizResults() {
    const questionResults = [];
    for (const question of this.questions) {
      questionResults.push( {'id': question.id, 'choice': question.choiceSelected} );
    }
    const body = { "username": user.username, 'questions': questionResults };

    const encounterRequest = {
      method: 'POST',
      headers: { 'Content-type': 'application/json',
        'Authorization': `Bearers ${user.token}` },
      body: JSON.stringify(body)
    };

    fetch(`${BASE_URL}/encounters/`, encounterRequest)
      .then((response) => response.json());
  }

  complete() {
    return this._currentQuestionIndex == this.questions.length ? true : false;
  }
}

class User {
  constructor(username, token) {
    this._username = username;
    this._token = token;
  }

  get username() {
    return this._username;
  }

  get token() {
    return this._token;
  }

  set username(name) {
    this._username = name;
  }

  set token(token) {
    this._token = token;
  }

  loggedIn() {
    return !!this.token
  }

  login(password) {
    const newSessionRequest = {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify( { username: this.username, password: password } )
    };

    return fetch(`${BASE_URL}/users/login`, newSessionRequest)
      .then((response) => response.json())
      .then((json) => {
        this.token = json.access_token;
        apiComm.setAuthorizationHeader(this.token);
        mainMenu()});
  }
}

class View {
  constructor() {  }

  static buildQuestionDiv() {
    document.querySelector("#content-div").innerHTML = "";

    this.newHTML("h1", "question-number");
    this.newHTML("h3", "stem");
    const choice1 = this.newHTML("h3", "choice1")
    choice1.className = "choice";
    const choice2 = this.newHTML("h3", "choice2")
    choice2.className = "choice";
    const choice3 = this.newHTML("h3", "choice3")
    choice3.className = "choice";
    const choice4 = this.newHTML("h3", "choice4")
    choice4.className = "choice";
  }

  static displayQuestion(question) {
    document.querySelector("#question-number").innerText = `Question #${question.questionNumber}`;
    document.querySelector("#stem").innerText = question.stem;
    document.querySelector("#choice1").innerText = `A. ${question.choices[0]}`;
    document.querySelector("#choice2").innerText = `B. ${question.choices[1]}`;
    document.querySelector("#choice3").innerText = `C. ${question.choices[2]}`;
    document.querySelector("#choice4").innerText = `D. ${question.choices[3]}`;
  }

  static displayTopicList() {
    this.clearContentDiv();

    const inst1 = this.newHTML("h2", "inst1");
    inst1.innerText = "Please select your quiz topics and the number of questions you'd like to answer...";

    const inst2 = this.newHTML("h3", "inst2");
    inst2.innerText = "If you do not select any topics, all topics will be included.";

    const ul = this.newHTML("ul", "list");

    for (const topic of topics) {
      const li = document.createElement("li");
      li.innerText = topic.name;
      ul.appendChild(li);
      const ck = document.createElement('input');
      ck.type = "checkbox";
      ck.id = `topic${topic.id}`
      li.appendChild(ck);
    }

    const p = this.newHTML("p", "label")
    p.innerText = "Number of Questions:";
    const num = this.newHTML("input", "num-questions");
    num.type = "textbox";
    num.value = "5";

    const button = this.newHTML("button", "make-quiz")
    button.innerText = "Create Quiz";
  }

  static getTopicList() {
    const topicIdList = [];
    const inputs = document.querySelectorAll("input");
    for (const input of inputs) {
      if(input.type == "checkbox" && input.checked) {
        topicIdList.push(parseInt(input.id.slice(5)))
      }
    }
    if (topicIdList.length == 0) { // select all topics if none were checked
      for (let input of inputs) {
        if(input.type == "checkbox") {
          topicIdList.push(parseInt(input.id.slice(5)))
        }
      }
    }
    return topicIdList;
  }

  static getNumberofQuestions() {
    return parseInt(document.querySelector("#num-questions").value);
  }

  static displayStats(stats) {
    this.clearContentDiv();

    const title = this.newHTML("h1", "title");
    title.innerText = `Question Performance Statistics for ${user.username}:`

    const list = this.newHTML("ul", "list");

    for (const stat_topic in stats) {
      const topic_stats = this.newHTML("li", `${stat_topic.toLowerCase()}-stats`, list)
      const correct = stats[`${stat_topic}`]["number_correct"];
      const possible = stats[`${stat_topic}`]["number_possible"];
      const percentage = ((correct / possible) * 100).toFixed(1);
      topic_stats.innerText =
        `${stat_topic}: ${correct} out of a possible ${possible} = ${percentage}%`
    }

    const backButton = this.newHTML("button", "back-to-main");
    backButton.innerText = "Back to Main Menu";
  }

  static displayMainMenu(message) {
    //if(user.loggedIn()) {
    this.clearContentDiv();

    const welcome = this.newHTML("h1", "welcome");
    welcome.innerText = "Generic Quiz App";

    const likeTo = this.newHTML("h3", "like-to");
    likeTo.innerText = "Would you like to...";

    const quizButton = this.newHTML("button", "quiz-button");
    quizButton.innerText = "Take a Quiz";

    const statsButton = this.newHTML("button", "stats-button");
    statsButton.innerText = "See Your Topic Stats";

    const newQuestionButton = this.newHTML("button", "new-question-button");
    newQuestionButton.innerText = "Create a new Question";

    const topicIndexButton = this.newHTML("button", "topic-index-button");
    topicIndexButton.innerText = "See list of topics";
  }

  static showLogin(loginErrorMessage = "") {
    this.clearContentDiv();

    welcome = this.newHTML("h1", "welcome");
    welcome.innerText = "Welcome to another Quiz App!"

    inst = this.newHTML("h3", "instructions");
    inst.innerText = "Please enter your username and password or create a new account";

    uname = this.newHTML("input", "username");
    uname.type = "textBox";
    uname.value = "username";

    this.newHTML("br", "br1");

    password = this.newHTML("input", "password");
    password.type = "password";
    password.value = "password"

    this.newHTML("br", "br2");

    submitCredsButton = this.newHTML("button", "login-button");
    submitCredsButton.innerText = "Log In";

    newUserButton = this.newHTML("button", "new-user-button");
    newUserButton.innerText = "New User";

    errorMessage = this.newHTML("h3", "error-message");
    errorMessage.innerText = loginErrorMessage;
  }

  static quizEndMessage(message) {
    const m = this.newHTML("h1", "quiz-message");
    m.innerText = message;

    const backButton = this.newHTML("button", "back-to-main");
    backButton.innerText = "Back to Main Menu";
  }

  static newUserPage() {
    this.clearContentDiv();

    welcome = this.newHTML("h1", "welcome");
    welcome.innerText = "Welcome to another Quiz App!"

    inst = this.newHTML("h3", "instructions");
    inst.innerText = "Please enter your desired username and password";

    uname = newTextInput("username", "Username: ");

    email = newTextInput("email", "Email: ");

    this.newHTML("br", "br1");

    const label = this.newHTML("label", `password-label`);
    label.innerText = "Password: ";
    password = this.newHTML("input", "password");
    password.type = "password";
    label.setAttribute("for", "password");

    this.newHTML("br", "br2");

    submitCredsButton = this.newHTML("button", "create-user-button");
    submitCredsButton.innerText = "Create User";
  }

  static clearContentDiv() {
    document.querySelector("#content-div").innerText = "";
  }

  static newHTML(tag, id, parentId = "#content-div") {
    const temp = document.createElement(tag);
    temp.id = id;
    document.querySelector("#content-div").appendChild(temp);
    return temp;
  }

  static newTextInput(id, labelText, parentId = "#content.div") {
    this.newHTML("br", "break");
    const label = this.newHTML("label", `${id}-label`, parentId);
    label.innerText = labelText;
    const text = this.newHTML("input", id, parentId);
    text.type = "textBox";
    label.setAttribute("for", id);
  }

  static newRadioInput(id, labelText, groupName, parentId = "#content.div") {
    this.newHTML("br", "break");
    const label = this.newHTML("label", "label");
    label.innerText = labelText;
    const choice = this.newHTML("input", id);
    choice.type = "radio";
    choice.setAttribute("name", groupName);
    label.setAttribute("for", id);
  }

  static newQuestionForm() {
    this.clearContentDiv();

    const title = this.newHTML("h1", "title");
    title.innerText = "Create a New Question:";

    const inst2 = this.newHTML("p", "choose-topic");
    inst2.innerText = "Question Topic: "

    for (const topic of topics) {
      this.newRadioInput(`radio-button-${topic.name.toLowerCase()}`,
        topic.name, "topic-choice");
    }
    this.newRadioInput("radio-button-new-topic", "New Topic", "topic-choice");
    const text = this.newHTML("input", "new-topic-text");
    text.type = "textBox";

    this.newHTML("br", "break");
    this.newTextInput("question-stem", "Question Stem: ");
    this.newTextInput("distractor-1", "Choice 1: ");
    this.newTextInput("distractor-2", "Choice 2: ");
    this.newTextInput("distractor-3", "Choice 3: ");
    this.newTextInput("distractor-4", "Choice 4: ");

    const inst3 = this.newHTML("p", "correct-choice");
    inst3.innerText = "Correct Answer:"

    for (let i = 1; i <=4; i++) {
      this.newRadioInput(`radio-button-${i}`, `Choice ${i}`, "answer-choice");
    }

    this.newHTML("br", "break");

    const btn = this.newHTML("button", "create-question-button");
    btn.innerText = "Create New Question";

    this.newHTML("br", "break");
    const backButton = this.newHTML("button", "back-to-main");
    backButton.innerText = "Back to Main Menu";
  }

  static listTopics() {
    this.clearContentDiv();

    const title = this.newHTML("h1", "title");
    title.innerText = "Topics:";

    for (const topic of topics) {
      const t = this.newHTML("h3", `topic-${topic.id}`);
      t.innerHTML = `${topic.name}&nbsp&nbsp`;
      const btn = this.newHTML("button", `delete-topic-${topic.id}`);
      btn.className = "delete-topic-button";
      t.style.display = "inline";
      btn.innerText = "Delete";
      const br = this.newHTML("br", "br");
    }

    this.newHTML("br", "break");
    const backButton = this.newHTML("button", "back-to-main");
    backButton.innerText = "Back to Main Menu";
  }
}

class APICommunicator {
  constructor() {
    this._headers = { "Content-type": "application/json" };
  }

  get headers() {
    return this._headers;
  }

  setAuthorizationHeader(token) { this._headers["Authorization"] = `Bearers ${token}` }

  getAllTopics() {
    topics = [];
    return fetch(`${BASE_URL}/topics`, { headers: this.headers })
      .then((response) => response.json())
      .then((json) => {
        json.forEach((topic) => {
        topics.push(new Topic(topic.id, topic.name))
      })
    });
  }

  requestQuiz(topicIdsArray, numberOfQuestions) {
    const topicIds = topicIdsArray.join(',');
    const questionIndexRequest = {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify( { topicIds: topicIds, numberOfQuestions: numberOfQuestions} )
    };

    return fetch(`${BASE_URL}/quizzes/`, questionIndexRequest)
      .then((response) => response.json())
      .then((json) => json.quiz);
  }

  deleteTopic(topicId) {
    const topicDeleteRequest = {
      method: 'DELETE',
      headers: this.headers,
    }

    return fetch(`${BASE_URL}/topics/${topicId}`, topicDeleteRequest)
      .then((response) => response.json())
      .then((json) => console.log(json));
  }
}

// Global (Window) Variables:
let quiz;
const user = new User();
let topics = [];
const BASE_URL = "http://localhost:3000";

// Topic Functions


function createNewTopic(topicName) {
  const newTopicRequest = {
    method: 'POST',
    headers: { 'Content-type': 'application/json',
      'Authorization': `Bearers ${user.token}` },
    body: JSON.stringify({
      topic_name: topicName
    })
  }

  return fetch(`${BASE_URL}/topics`, newTopicRequest)
    .then((response) => response.json())
    .then((json) => json.message );
}



// Quiz Functions
function getAndAdministerQuiz() {
  const selectedTopics = View.getTopicList();
  const numberOfQuestions = View.getNumberofQuestions();
  View.buildQuestionDiv();
  apiComm.requestQuiz(selectedTopics, numberOfQuestions)
    .then((questionArray) => quiz = instantiateQuiz(questionArray))
    .then(() => quiz.askQuestion());
}

function removeTopic(id) {
  apiComm.deleteTopic(id)
    .then(() => {
      let indexToRemove;
      for (let i = 0; i < topics.length; i++) {
        if (topics[i].id == id) { indexToRemove = i }
      }
      topics.splice(indexToRemove, 1);
      mainMenu();
    })
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

function createUser(username, email, password) {
  const newUserRequest = {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({
      username: username, email: email, password: password
    })
  }

  fetch(`${BASE_URL}/users`, newUserRequest)
    .then((response) => response.json())
    .then((json) => {
      user.username = username;
      user.token = json.access_token;
    });
}

// Helper Functions


// Display / DOM interaction (View)
function getStats() {
  return fetch(`${BASE_URL}/encounters/${user.username}`, {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearers ${user.token}`
      }
    })
    .then((response) => response.json());
}

// Need to fix - if new topic is also created, new question is attempting to be created before the topic response
function createQuestion() {
  const questionData = getNewQuestionData();

  const newQuestionRequest = {
    method: 'POST',
    headers: { 'Content-type': 'application/json',
      'Authorization': `Bearers ${user.token}` },
    body: JSON.stringify({ questionData })
  }

  fetch(`${BASE_URL}/questions`, newQuestionRequest)
    .then((response) => response.json())
    .then((json) => {
      if(json.message == "Success") {
        mainMenu();
      } else {
        msg = View.newHTML("h2", "message");
        msg.innerText = json.message;
      }
    });
}

function getNewQuestionData () {
  questionObject = {};

  const topicName = document.querySelector("input[name=topic-choice]:checked").id.slice(13);

  if (topicName == "new-topic") {
    questionObject['topicId'] = createNewTopic(document.querySelector("#new-topic-text").value);
  } else {
    topics.forEach((topic) => {
      if (topic.name.toLowerCase() == topicName) {
        questionObject['topicId'] = topic.id;
      }
    })
  }

  setTimeout(()=> console.log("waiting..."), 1000);

  questionObject["stem"] = document.querySelector("#question-stem").value;
  questionObject["choice1"] = document.querySelector("#distractor-1").value;
  questionObject["choice2"] = document.querySelector("#distractor-2").value;
  questionObject["choice3"] = document.querySelector("#distractor-3").value;
  questionObject["choice4"] = document.querySelector("#distractor-4").value;

  questionObject['correctChoice'] = document.querySelector("input[name=answer-choice]:checked").id.slice(13);

  return questionObject;
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
    } else if (id == "login-button") {
      user = new User(document.querySelector("#username").value)
      user.login(document.querySelector("#password").value);
    } else if (id == "back-to-main") {
      mainMenu();
    } else if (id == "new-user-button") {
      View.newUserPage();
    } else if (id == "create-user-button") {
      createUser(document.querySelector("#username").value,
      document.querySelector("#email").value,
        document.querySelector("#password").value);
    } else if (id == "stats-button") {
      getAndDisplayStats();
    } else if (id == "new-question-button") {
      if(topics.length == 0) {
        apiComm.getAllTopics()
          .then(() => View.newQuestionForm());
      } else {
        View.newQuestionForm();
      }
    } else if (id == "create-question-button") {
      createQuestion();
    } else if (id == "topic-index-button") {
      showTopics();
    } else if (e.target.className == "delete-topic-button") {
      removeTopic(parseInt(id.slice(13)));
    }
  })

  document.addEventListener("keydown", (e) => {
    if(e.keyCode === 13 && !!document.querySelector("#login-button")) {
      user = new User(document.querySelector("#username").value)
      user.login(document.querySelector("#password").value);
    } else if (e.keyCode === 13 && !!document.querySelector("#create-question-button")) {
      createQuestion();
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

function showTopics() {

  if (topics.length == 0) {
    apiComm.getAllTopics()
      .then(() => View.listTopics());
  } else {
    View.listTopics();
  }
}
// Program flow
function setUpQuiz() {
  if (topics.length == 0) {
    apiComm.getAllTopics()
      .then(() => View.displayTopicList());
  } else {
    View.displayTopicList();
  }
}

function mainMenu() {
  if(user.loggedIn) {
    View.displayMainMenu();
  } else {
    view.showLogin();
  }
}

  // Prompt for Username
function getAndDisplayStats() {
    getStats()
      .then((stats) => View.displayStats(stats.message));
  }

listeners();
const view = new View();
const apiComm = new APICommunicator();

user.username = "btate712";
user.login("temp");

mainMenu();// is called at end of login()
