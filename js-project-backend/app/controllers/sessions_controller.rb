class SessionsController < ApplicationController

  def create
    user = User.find_by(username: params[:username])

    if user && user.authenticate(params[:password])
      session[:user_id] = user.id
      render json: { id: session[:user_id] }
    else
      render json: { message: "Authentication Failure" }
    end
  end

  def destroy
    session.clear
  end
end
