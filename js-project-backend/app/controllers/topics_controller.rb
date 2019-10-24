class TopicsController < ApplicationController
  def index
    topics = Topic.all
    render json: topics, only: [:id, :name]
  end

  def create
    topic = Topic.new
    topic.name = params[:topic_name]
    if !Topic.find_by(name: topic.name)
      topic.save
      render json: { message: topic.id }
    else
      render json: { message: "fail - topic already exists" }
    end
  end

  def destroy
    if topic = Topic.find(params[:id])
      questions = topic.questions
      if questions
        questions.each do |question|
          if question.encounters
            question.encounters.each do |encounter|
              encounter.delete
            end
          end 
          question.delete
        end
      end
      topic.delete
      render json: { message: "success" }
    else
      render json: { message: "fail - topic not found" }
    end
  end
end
