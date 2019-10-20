class Topic < ApplicationRecord
  has_many :questions
  validates :name, uniqueness: true, presence: true 
end
