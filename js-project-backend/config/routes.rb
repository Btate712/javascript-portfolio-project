Rails.application.routes.draw do
  resources :topics
  resources :encounters
  resources :questions
  resources :users
  resources :quizzes, only: [:create]
  resources :sessions, only: [:create, :destroy]
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
