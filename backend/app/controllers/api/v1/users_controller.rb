module Api
  module V1
    class UsersController < ApplicationController
      skip_before_action :require_login

      def create
        user = User.create!(user_params)

        login(user)
        render json: { id: user.id, email: user.email }, status: :created
      end

      private

      def user_params
        params.permit(:email, :password)
      end
    end
  end
end
