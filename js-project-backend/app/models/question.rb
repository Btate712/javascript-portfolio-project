class Question < ApplicationRecord
  has_many :encounters
  has_many :users, through: :encounters
  belongs_to :topic

  validates :stem, :choice_1, :choice_2, :choice_3, :choice_4, :correct_choice, :topic_id, presence: true
end
