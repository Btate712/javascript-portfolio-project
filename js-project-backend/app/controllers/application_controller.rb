class ApplicationController < ActionController::API
  include ActionController::Helpers
  
  helper_method :logged_in?, :current_user

  def logged_in?
    !!current_user
  end

  def current_user
    if session[:user_id]
      current_user ||= User.find(session[:user_id])
    end
  end

  def require_login
    unless logged_in?
      render json: { message: "You must log in to use this API."}
    end
  end

end
