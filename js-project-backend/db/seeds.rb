# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

bob = User.new
bob.username = "Bob"
bob.save

q1 = Question.new
q1.stem = "What is 2 + 2?"
q1.choice_1 = "1"
q1.choice_2 = "2"
q1.choice_3 = "3"
q1.choice_4 = "4"
q1.correct_choice = 4
q1.save

e = Encounter.new
e.user = bob
e.question = q1
e.save
