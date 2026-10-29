class SpaController < ApplicationController
  skip_before_action :require_login

  def index
    send_file Rails.public_path.join("index.html"), type: "text/html", disposition: "inline"
  end
end
