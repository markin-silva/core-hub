require "rails_helper"

RSpec.describe "Authentication", type: :request do
  let(:password) { "correct-horse" }

  describe "POST /api/v1/users" do
    it "creates an account and logs the user in" do
      post "/api/v1/users", params: { email: "ana@example.com", password: password }

      expect(response).to have_http_status(:created)
      created = User.find_by!(email: "ana@example.com")
      expect(response.parsed_body).to eq("id" => created.id, "email" => "ana@example.com")
      expect(response.headers["Set-Cookie"]).to include("_core_hub_session=")
    end

    it "rejects a password shorter than 8 characters as a problem" do
      post "/api/v1/users", params: { email: "ana@example.com", password: "short" }

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.media_type).to eq("application/problem+json")
      expect(response.parsed_body).to eq(
        "type" => "about:blank",
        "title" => "Validation failed",
        "status" => 422,
        "detail" => "Some fields are invalid.",
        "code" => "validation_failed",
        "errors" => { "password" => [ "is too short (minimum is 8 characters)" ] }
      )
    end

    it "translates validation messages to Portuguese when Accept-Language asks for it" do
      post "/api/v1/users", params: { email: "ana@example.com", password: "short" },
                            headers: { "Accept-Language" => "pt-BR" }

      expect(response.parsed_body["errors"]).to eq(
        "password" => [ "é muito curto (mínimo de 8 caracteres)" ]
      )
    end

    it "rejects a missing password" do
      post "/api/v1/users", params: { email: "ana@example.com" }

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body["errors"]).to eq("password" => [ "can't be blank" ])
    end

    it "rejects a duplicate email regardless of case" do
      create(:user, email: "ana@example.com")
      post "/api/v1/users", params: { email: "ANA@example.com", password: password }

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body["errors"]).to eq("email" => [ "has already been taken" ])
    end
  end

  describe "POST /api/v1/session" do
    let!(:user) { create(:user, email: "ana@example.com", password: password) }

    it "logs in with the correct credentials" do
      post "/api/v1/session", params: { email: "ana@example.com", password: password }

      expect(response).to have_http_status(:created)
      expect(response.headers["Set-Cookie"]).to include("_core_hub_session=")
    end

    it "returns the same generic problem for a wrong password and an unknown email" do
      post "/api/v1/session", params: { email: "ana@example.com", password: "wrong-password" }
      wrong_password = response.parsed_body

      post "/api/v1/session", params: { email: "nobody@example.com", password: password }
      unknown_email = response.parsed_body

      expect(response).to have_http_status(:unauthorized)
      expect(wrong_password).to eq(unknown_email)
      expect(wrong_password).to eq(
        "type" => "about:blank",
        "title" => "Invalid credentials",
        "status" => 401,
        "detail" => "The email or password is incorrect.",
        "code" => "invalid_credentials"
      )
    end

    it "is rate limited after 10 attempts with a problem response" do
      11.times { post "/api/v1/session", params: { email: "ana@example.com", password: "wrong-password" } }

      expect(response).to have_http_status(:too_many_requests)
      expect(response.media_type).to eq("application/problem+json")
      expect(response.parsed_body).to eq(
        "type" => "about:blank",
        "title" => "Too many attempts",
        "status" => 429,
        "detail" => "Too many login attempts. Try again in a few minutes.",
        "code" => "too_many_attempts"
      )
    end

    it "returns the message in Portuguese when Accept-Language asks for it" do
      post "/api/v1/session", params: { email: "ana@example.com", password: "wrong-password" },
                              headers: { "Accept-Language" => "pt-BR,pt;q=0.9" }

      expect(response.parsed_body).to eq(
        "type" => "about:blank",
        "title" => "Credenciais inválidas",
        "status" => 401,
        "detail" => "O e-mail ou a senha estão incorretos.",
        "code" => "invalid_credentials"
      )
    end

    it "falls back to English for an unsupported language" do
      post "/api/v1/session", params: { email: "ana@example.com", password: "wrong-password" },
                              headers: { "Accept-Language" => "fr-FR" }

      expect(response.parsed_body["title"]).to eq("Invalid credentials")
    end
  end

  describe "GET /api/v1/me" do
    it "returns a 401 problem without a session" do
      get "/api/v1/me"

      expect(response).to have_http_status(:unauthorized)
      expect(response.media_type).to eq("application/problem+json")
      expect(response.parsed_body).to eq(
        "type" => "about:blank",
        "title" => "Unauthorized",
        "status" => 401,
        "detail" => "You must be logged in to do this.",
        "code" => "unauthenticated"
      )
    end

    it "returns the current user after login" do
      user = create(:user, email: "ana@example.com", password: password)
      post "/api/v1/session", params: { email: user.email, password: password }

      get "/api/v1/me"

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to eq("id" => user.id, "email" => "ana@example.com")
    end
  end

  describe "DELETE /api/v1/session" do
    it "ends the session so /me returns 401 again" do
      user = create(:user, email: "ana@example.com", password: password)
      post "/api/v1/session", params: { email: user.email, password: password }

      delete "/api/v1/session"
      get "/api/v1/me"

      expect(response).to have_http_status(:unauthorized)
    end
  end
end
