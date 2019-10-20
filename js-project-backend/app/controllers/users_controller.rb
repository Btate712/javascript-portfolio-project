class UsersController < ApplicationController

  def index
    users = User.all
    render json: users, only: [:id, :username]
  end

  def show
    user = User.find_by(params[:id])
    render json: user, only: [:id, :username]
  end

  def create
    user = User.new
    user.username = params[:username]
    user.password = params[:password]
    if(user.save)
      render json: { message: "Successfully created new user.  Please log in." }
    else
      render json: { message: user.errors.messages.inspect }
    end
  end

  def destroy
    def destroy
      if user = User.find(params[:id])
        user.delete
        render json: { message: "success" }
      else
        render json: { message: "fail - user not found" }
      end
    end
  end

  private

  def user_params(* args)
    params.require(:user).permit(args)
  end
end
