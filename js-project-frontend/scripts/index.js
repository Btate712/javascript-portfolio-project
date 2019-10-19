const BASE_URL = "http://localhost:3000";

class Question {
  constructor(questionObject) {
    this._id = questionObject.id;
    this._topicId = questionObject.topic_id;
    this._stem = questionObject.stem;
    this._choices = [questionObject.choice_1, questionObject.choice_2,
      questionObject.choice_3, questionObject.choice_4];
    this._correctChoice = questionObject.correct_choice;
    this._choiceSelected = 0;
  }

  get id() { return _id; }
  get topicId() { return _topicId; }
  get stem() { return _stem; }
  get choices() { return _choices; }
  get correctChoice() { return _correctChoice }
  get choiceSelected() { return _choiceSelected }

  set choiceSelected(choice) {
    _choiceSelected = choice
    choice == correctChoice ? return true : return false;
  }
}

class Quiz {
  constructor(questionArray) {
    this.questions = questionArray;
  }
}

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

function administerQuiz(quiz) {
  for (question of quiz.questions) {
    // display question
    // respond to user input
    // update score
    //
  }
}

function buildOOQuiz(questionObjectArray) {
  const questionInstanceArray = [];
  for (const question of questionObjectArray) {
    questionInstanceArray.push(new Question(question));
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
