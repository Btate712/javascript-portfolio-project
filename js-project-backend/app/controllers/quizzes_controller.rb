class QuizzesController < ApplicationController
  def create
    topic_ids = params[:topic_ids].split(", ")
    puts topic_ids
  end
end
