class Question < ApplicationRecord
  has_many :encounters
  has_many :users, through: :encounters
  belongs_to :topic
end
