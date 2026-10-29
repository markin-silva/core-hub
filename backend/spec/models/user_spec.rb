require "rails_helper"

RSpec.describe User, type: :model do
  subject(:user) { build(:user) }

  describe "validations" do
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
    it { is_expected.to allow_value("owner@example.com").for(:email) }
    it { is_expected.not_to allow_value("not-an-email").for(:email) }
    it { is_expected.to validate_length_of(:password).is_at_least(8) }
  end

  describe "email normalization" do
    it "strips whitespace and downcases the email" do
      user.email = "  Ana@Example.COM "
      user.validate

      expect(user.email).to eq("ana@example.com")
    end

    it "treats differently cased emails as the same account" do
      create(:user, email: "ana@example.com")
      duplicate = build(:user, email: "ANA@example.com")

      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:email]).to be_present
    end
  end

  describe "authentication" do
    it "authenticates with the correct password" do
      user = create(:user, password: "correct-horse")

      expect(user.authenticate("correct-horse")).to eq(user)
    end

    it "does not authenticate with a wrong password" do
      user = create(:user, password: "correct-horse")

      expect(user.authenticate("wrong-password")).to be(false)
    end
  end
end
