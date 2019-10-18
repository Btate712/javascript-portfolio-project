class TopicsController < ApplicationController
  def index
    topics = Topic.all
    render json: topics, only: [:id, :name]
  end

  def create
    topic = Topic.new
    topic.name = params['topic_name']
    if !Topic.find_by(name: topic.name)
      topic.save
      render json: { message: "success" }
    else
      render json: { message: "fail" }
    end
  end
end
