// Global Constants:
const BASE_URL = "http://localhost:3000";

// Classes (Model)
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
    return (this.choiceSelected == this.correctChoice ? true : false);
  }
}

class Quiz {
  constructor(questionArray) {
    this._questions = questionArray;
  }

  get questions() { return this._questions }
}

// Interface Methods (Controller)
function requestQuiz(topicIdsArray, numberOfQuestions) {
  const topicIds = topicIdsArray.join(',');
  const questionIndexRequest = {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify( { topicIds: topicIds, numberOfQuestions: numberOfQuestions} )
  };

  fetch(`${BASE_URL}/quizzes/`, questionIndexRequest)
    .then((response) => response.json())
    .then((json) => administerQuiz(buildOOQuiz(json.quiz)));
}

function buildOOQuiz(questionObjectArray) {
  const questionInstanceArray = [];
  let index = 1;
  for (const question of questionObjectArray) {
    questionInstanceArray.push(new Question(question, index));
    index++;
  }
  const quiz = new Quiz(questionInstanceArray);
  return quiz;
}

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
  fetch(`${BASE_URL}/topics`)
    .then((response) => response.json())
    .then((json) => console.log(json));
}

function administerQuiz(quiz) {
  let numberCorrect = 0;
  buildQuestionDiv();
  for (question of quiz.questions) {
    console.log("new question");
    displayQuestion(question);
    firstTry = true;
    questionComplete = false;
    while (!questionComplete) {
      document.addEventListener("click", (e) => {
        if (e.target.className == "choice") {
          choice = e.target.id;
          choiceNumber = choice[choice.length - 1];
          question.choiceSelected = choiceNumber;
          if (question.answeredCorrectly() && firstTry && !questionComplete) {
            numberCorrect++;
            questionComplete = true;
          } else {
            firstTry = false;
          }
          console.log(numberCorrect);
        }
      })
    }
  }
}

// Display / DOM interaction (View)
function displayQuestion(question) {
  document.querySelector("#question-number").innerText = `Question #${question.questionNumber}`;
  document.querySelector("#stem").innerText = question.stem;
  document.querySelector("#choice1").innerText = `A. ${question.choices[0]}`;
  document.querySelector("#choice2").innerText = `B. ${question.choices[1]}`;
  document.querySelector("#choice3").innerText = `C. ${question.choices[2]}`;
  document.querySelector("#choice4").innerText = `D. ${question.choices[3]}`;
}

function buildQuestionDiv() {
  document.querySelector("body").innerHTML = "";

  questionDiv = document.createElement("div");
  questionDiv.id = "question";
  document.querySelector("body").appendChild(questionDiv);

  questionNumber = document.createElement("h1");
  questionNumber.id = "question-number";
  questionDiv.appendChild(questionNumber);

  stem = document.createElement("h3");
  stem.id="stem";
  questionDiv.appendChild(stem);

  choice1 = document.createElement("h3");
  choice1.id = "choice1";
  choice1.className = "choice";
  questionDiv.appendChild(choice1);

  choice2 = document.createElement("h3");
  choice2.id = "choice2";
  choice2.className = "choice";
  questionDiv.appendChild(choice2);

  choice3 = document.createElement("h3");
  choice3.id = "choice3";
  choice3.className = "choice";
  questionDiv.appendChild(choice3);

  choice4 = document.createElement("h3");
  choice4.id = "choice4";
  choice4.className = "choice";
  questionDiv.appendChild(choice4);

  return questionDiv;
}

// Program flow
quiz = requestQuiz([1,2], 3);
