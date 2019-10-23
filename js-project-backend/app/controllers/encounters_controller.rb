class EncountersController < ApplicationController
  def create
    failed = 0
    user_id = User.find_by(username: params[:username]).id
    params[:questions].each do |question|
      e = Encounter.new(user_id: user_id, question_id: question[:id],
        selected_answer: question[:choice])
      failed += 1 if !e.save
    end
    render json: { message: "#{failed} encounters failed to save." }
  end

  def show
    # show method is actually being used as an index method filtered to
    # only provide information for the user whose user_id is supplied via the
    # ":id" portion of the URL.  The information returned via json is a summary
    # of quiz question performance for each topic.
    user_stats = Encounter.stats(User.find_by(username: params[:id]).id)
    render json: { message: user_stats }
  end
end
