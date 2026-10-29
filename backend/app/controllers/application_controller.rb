class ApplicationController < ActionController::API
  include ApiErrors
  include Authenticatable

  around_action :switch_locale
  before_action :require_login

  private

  def switch_locale(&action)
    I18n.with_locale(requested_locale, &action)
  end

  # Picks the first Accept-Language entry we support, matching on the primary language
  # subtag (so "pt" and "pt-BR" both select pt-BR). Falls back to the default locale.
  def requested_locale
    request.accept_language.to_s.split(",").each do |entry|
      language = entry.split(";").first.to_s.strip.split("-").first.to_s.downcase
      match = I18n.available_locales.find { |locale| locale.to_s.split("-").first == language }
      return match if match
    end

    I18n.default_locale
  end
end
