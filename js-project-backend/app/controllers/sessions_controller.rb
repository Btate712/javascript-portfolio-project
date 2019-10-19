class SessionsController < ApplicationController

  def create
    user = User.find_by(username: params[:user][:username])

    if user && user.authenticate(params[:user][:password])
      session[:user_id] = user.id
      render json: { message: "User Authenticated" }
    else
      render json: { message: "Authentication Failure" }
    end
  end

  def destroy
    session.clear
  end
