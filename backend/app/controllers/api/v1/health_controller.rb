module Api
  module V1
    class HealthController < ApplicationController
      skip_before_action :require_login

      def show
        render json: { status: "ok" }
      end
    end
  end
end
