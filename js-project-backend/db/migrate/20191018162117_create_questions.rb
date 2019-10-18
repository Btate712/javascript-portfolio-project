class CreateQuestions < ActiveRecord::Migration[5.2]
  def change
    create_table :questions do |t|
      t.integer :topic_id
      t.string :stem
      t.string :choice_1
      t.string :choice_2
      t.string :choice_3
      t.string :choice_4
      t.integer :correct_choice

      t.timestamps
    end
  end
end
