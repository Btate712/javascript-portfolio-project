class User < ApplicationRecord
  has_many :encounters
  has_many :questions, through: :encounters
end
