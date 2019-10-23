class UsersController < ApplicationController
  skip_before_action :authenticate_request, only: %i[login create]

  def index
    users = User.all
    render json: users, only: [:id, :username]
  end

  def show
    user = User.find_by(params[:id])
    render json: user, only: [:id, :username]
  end

  def create
    user = User.create(user_params)
    if(user.save)
      response = { message: "Successfully created new user.  Please log in." }
      login
    else
      render json: { message: "Made it here..."} #{user.errors, status: :bad}
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

  def login
    authenticate params[:username], params[:password]
  end

  def test
    render json: {
          message: 'You have passed authentication and authorization test'
        }
  end

  private

  def user_params
    params.permit(
      :username,
      :email,
      :password
    )
  end

  def authenticate(username, password)
  command = AuthenticateUser.call(username, password)

    if command.success?
      render json: {
        access_token: command.result,
        message: 'Login Successful'
      }
    else
      render json: { error: command.errors }, status: :unauthorized
    end
  end
end
