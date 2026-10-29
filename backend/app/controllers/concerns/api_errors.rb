module ApiErrors
  extend ActiveSupport::Concern

  # Problem Details (RFC 9457). Every error response from the API uses this shape.
  PROBLEM_CONTENT_TYPE = "application/problem+json".freeze

  included do
    rescue_from ActiveRecord::RecordInvalid, with: :render_validation_error
    rescue_from ActionController::ParameterMissing, with: :render_bad_request
  end

  private

  def render_problem(status:, code:, detail: nil, errors: nil)
    status_code = Rack::Utils.status_code(status)
    body = {
      type: "about:blank",
      title: I18n.t("errors.#{code}.title", default: Rack::Utils::HTTP_STATUS_CODES.fetch(status_code)),
      status: status_code,
      detail: detail || I18n.t("errors.#{code}.detail", default: nil),
      code: code,
      errors: errors
    }
    render json: body.compact, status: status_code, content_type: PROBLEM_CONTENT_TYPE
  end

  # Messages are resolved when the errors hash is built, not when validation runs. The
  # rescue handler runs after switch_locale has restored the default, so build the hash
  # again under the request locale.
  def render_validation_error(exception)
    errors = I18n.with_locale(requested_locale) { exception.record.errors.to_hash }

    render_problem(
      status: :unprocessable_content,
      code: "validation_failed",
      errors: errors
    )
  end

  def render_bad_request(exception)
    render_problem(status: :bad_request, code: "bad_request", detail: exception.message)
  end
end
