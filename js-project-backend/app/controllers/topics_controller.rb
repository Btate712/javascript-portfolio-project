class TopicsController < ApplicationController
  def index
    topics = Topic.all
    render json: topics, only: [:id, :name]
  end

  def create
    topic = Topic.new
    topic.name = params[:id]
    if !Topic.find_by(name: topic.name)
      topic.save
      render json: { message: "success" }
    else
      render json: { message: "fail - topic already exists" }
    end
  end

  def destroy
    topicId = params[:id]
    if topic = Topic.find(topicId)
      topic.delete
      render json: { message: "success" }
    else
      render json: { message: "fail - topic not found" }
    end
  end
end
