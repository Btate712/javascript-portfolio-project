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
    user = User.new(user_params(:username, :password))
    if(User.save)
      render json: { message: "success" }
    else
      render json: { message: "fail - topic already exists" }
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
