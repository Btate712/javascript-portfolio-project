class User < ApplicationRecord
  has_many :encounters
  has_many :questions, through: :encounters

  has_secure_password
  validates_presence_of :username, :email, :password_digest
  validates :email, uniqueness: true
end
