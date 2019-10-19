class User < ApplicationRecord
  has_many :encounters
  has_many :questions, through: :encounters

  has_secure_password

  validates :username, presence: true, uniqueness: true
end
