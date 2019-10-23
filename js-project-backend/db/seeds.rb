# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

topics = [
  Topic.new(name: "Math"), Topic.new(name: "Science"), Topic.new(name: "Spanish")]

topics.each { |topic| topic.save }

questions = [
  Question.new(stem: "What is 2 + 2?", choice_1: "1", choice_2: "2",
    choice_3: "3", choice_4: "4", correct_choice: "4",
    topic: Topic.find_by(name: "Math")),
  Question.new(stem: "What is 2 + 3", choice_1: "4", choice_2: "5",
    choice_3: "6", choice_4: "7", correct_choice: "2",
    topic: Topic.find_by(name: "Math")),
  Question.new(stem: "What is the symbol for Oxygen?", choice_1: "O",
     choice_2: "Ox", choice_3: "Og", choice_4: "On", correct_choice: "1",
     topic: Topic.find_by(name: "Science")),
  Question.new(stem: "How many meters in a km?", choice_1: "100",
    choice_2: "1000", choice_3: "10000", choice_4: "100000",
    correct_choice: "2", topic: Topic.find_by(name: "Science")),
  Question.new(stem: "How do you say 'large' in Spanish?", choice_1: "largeo",
    choice_2: "pequeno", choice_3: "grande", choice_4: "biggo",
    correct_choice: "3", topic: Topic.find_by(name: "Spanish")),
  Question.new(stem: "What does 'estrella' mean in English?",
    choice_1: "street", choice_2: "extra", choice_3: "strange",
    choice_4: "star", correct_choice: "4", topic: Topic.find_by(name: "Math"))]

questions.each { |question| question.save }
