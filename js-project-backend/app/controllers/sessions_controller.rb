class SessionsController < ApplicationController

  def create
    user = User.find_by(username: params[:username])

    if user && user.authenticate(params[:password])
      session[:user_id] = user.id
      render json: { id: session[:user_id], username: user.username }
    else
      render json: { message: "Authentication Failed - Please check your username and password." }
    end
  end

  def destroy
    session.clear
    render json: { message: "User logged out..." }
  end
end
