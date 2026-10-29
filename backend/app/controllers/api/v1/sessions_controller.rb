module Api
  module V1
    class SessionsController < ApplicationController
      skip_before_action :require_login

      rate_limit to: 10, within: 3.minutes, only: :create,
                 with: -> { render_problem(status: :too_many_requests, code: "too_many_attempts") }

      def create
        user = User.find_by(email: params[:email])

        if user&.authenticate(params[:password])
          login(user)
          render json: { id: user.id, email: user.email }, status: :created
        else
          render_problem(status: :unauthorized, code: "invalid_credentials")
        end
      end

      def destroy
        logout
        head :no_content
      end
    end
  end
end
