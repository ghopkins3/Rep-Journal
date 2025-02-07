# WorkoutTracker
Personal workout tracker 


exercises [icon: user, color: blue] {
  exercise_id int
  exercise_name string
}

exercise_sets [icon: users, color: blue] {
  exercise_set_id int
  exercise_id int
  exercise_name string
  reps int
  weight float
}

workouts [icon: users, color: blue] {
  workout_id id 
  date date
}

workouts_exercises [icon: user, color: green] {
  workout_exercises_id int
  workout_id int
  exercise_id int
}