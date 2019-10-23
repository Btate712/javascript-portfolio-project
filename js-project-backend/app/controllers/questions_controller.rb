class QuestionsController < ApplicationController
  def create
    qdata = params[:questionData]
    question = Question.new()
    question.topic_id = qdata[:topicId]
    question.stem = qdata[:stem]
    question.choice_1 = qdata[:choice1]
    question.choice_2 = qdata[:choice2]
    question.choice_3 = qdata[:choice3]
    question.choice_4 = qdata[:choice4]
    question.correct_choice = qdata[:correctChoice]
    if (question.save)
      render json: { message: "Success" }
    else
      render json: { message: question.errors.messages.inspect }
    end
  end
end
