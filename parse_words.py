import json

text_content = """
Animals
bear
bird
cat
cow
dog
duck
elephant
fish
horse
monkey
pig
rabbit/bunny
sheep
Household
bathhtub
chair
cup
door
knife
phone
potty/toilet
spoon
table
toothbrush
Body Parts
ear
eyes
foot
hair
hand
mouth
nose
teeth
Clothes
boot/s
coat
diaper
hat
pants
shirt
shoe/s
sock/s
Nature
flower
rain
sun
tree
People
baby
boy
Daddy
girl
Mommy
Food
apple
banana
candy
cheese
cookie
cracker
French fries
hamburger
hotdog
ice cream cone
juice
milk
pizza
strawberry
water
Toys/Travel
airplane
ball
balloon
bike
book
bubbles
car
train
Action Words/Verbs
blow
clap
cry
cut
drink
Action Words/Verbs (cont.)
drive
drop
eat
fall down
hug
jump
kick
kiss
open
pour
push
run
sit down
sleep
stir
throw
turn around
walk
wash
Adjectives
blue
green
orange
purple
red
yellow
one
two
three
big/little
clean/dirty
happy/sad
hot/cold
"""

lines = text_content.strip().split('\n')
parsed_data = {}
current_category = None

for line in lines:
    line = line.strip()
    if not line:
        continue

    # Check if the line is a category header
    if line in ["Animals", "Household", "Body Parts", "Clothes", "Nature", "People", "Food", "Toys/Travel", "Action Words/Verbs", "Adjectives"]:
        current_category = line
        parsed_data[current_category] = []
    elif line == "Action Words/Verbs (cont.)":
        # Merge with the previous Action Words/Verbs category
        current_category = "Action Words/Verbs"
    elif current_category:
        parsed_data[current_category].append(line)
    else:
        # This case should ideally not happen if categories are always first
        print(f"Warning: Word '{line}' found before any category.")

print(json.dumps(parsed_data))