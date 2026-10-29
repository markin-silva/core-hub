require "rails_helper"
require "tmpdir"

RSpec.describe "SPA fallback", type: :request do
  let(:public_dir) { Dir.mktmpdir }

  before do
    File.write(File.join(public_dir, "index.html"), "<!doctype html><title>core-hub</title>")
    allow(Rails).to receive(:public_path).and_return(Pathname.new(public_dir))
  end

  after { FileUtils.remove_entry(public_dir) }

  it "returns index.html for a client-side route" do
    get "/finances/2026/10"

    expect(response).to have_http_status(:ok)
    expect(response.media_type).to eq("text/html")
    expect(response.body).to include("<title>core-hub</title>")
  end

  it "does not serve index.html for unknown /api paths" do
    get "/api/unknown"

    expect(response).to have_http_status(:not_found)
    expect(response.body).not_to include("<title>core-hub</title>")
  end
end
