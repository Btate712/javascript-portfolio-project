class EncountersController < ApplicationController
  def create
    failed = 0
    user_id = params[:userId]
    params[:questions].each do |question|
      e = Encounter.new(user_id: user_id, question_id: question[:id],
        selected_answer: question[:choice])
      failed += 1 if !e.save
    end
    render json: { message: "#{failed} encounters failed to save." }
  end
end
