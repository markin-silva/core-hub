require "rails_helper"

RSpec.describe "GET /api/v1/health", type: :request do
  it "returns 200 with an ok status" do
    get "/api/v1/health"

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body).to eq("status" => "ok")
  end

  it "returns 404 for unknown API routes under /api" do
    get "/api/v1/does-not-exist"

    expect(response).to have_http_status(:not_found)
  end
end
