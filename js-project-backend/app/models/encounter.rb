class Encounter < ApplicationRecord
  belongs_to :user
  belongs_to :question

  def self.stats(user_id) #return stats for user with the following format:
    # { topic_1: {number_correct: xxx, number_possible: xxx },
    #   topic_2: {number_correct: xxx, number_possible: xxx },
    #   topic... etc }
    user_encounters = self.all.filter { |encounter| encounter.user.id == user_id }
    topic_encounters = user_encounters.uniq { |encounter| encounter.question.topic }
    topic_names = topic_encounters.collect { |encounter| encounter.question.topic.name }
    user_stats = {}
    topic_names.each { |topic_name| user_stats[topic_name] = {} }
    topic_names.each do |topic_name|
      topic_encounters = user_encounters.filter { |encounter| encounter.question.topic.name == topic_name }
      user_stats[topic_name]["number_correct"] =
        topic_encounters.filter { |encounter| encounter.question.correct_choice == encounter.selected_answer }.count
      user_stats[topic_name]["number_possible"] = topic_encounters.count
    end
    return user_stats
  end
end
