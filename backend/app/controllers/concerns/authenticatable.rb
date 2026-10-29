module Authenticatable
  extend ActiveSupport::Concern

  # The cookie and session middleware is added globally in config/application.rb (ADR-0014).
  # This concern only provides the helpers; it does not enable anything itself.

  private

  def current_user
    return @current_user if defined?(@current_user)

    @current_user = session[:user_id] && User.find_by(id: session[:user_id])
  end

  def login(user)
    reset_session
    session[:user_id] = user.id
    @current_user = user
  end

  def logout
    reset_session
    @current_user = nil
  end

  def require_login
    return if current_user

    render_problem(status: :unauthorized, code: "unauthenticated")
  end
end
