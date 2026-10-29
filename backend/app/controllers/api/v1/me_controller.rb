module Api
  module V1
    class MeController < ApplicationController
      def show
        render json: { id: current_user.id, email: current_user.email }
      end
    end
  end
end
