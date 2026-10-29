Rails.application.routes.draw do
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      get "health", to: "health#show"
    end
  end

  # SPA fallback: client-side routes return the React entry point (ADR-0009).
  # Unknown /api paths are excluded so they keep returning 404.
  get "*path", to: "spa#index", constraints: ->(request) { !request.path.start_with?("/api") }
end
