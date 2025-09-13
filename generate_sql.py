
import json
import os

parsed_data = {"Animals": ["bear", "bird", "cat", "cow", "dog", "duck", "elephant", "fish", "horse", "monkey", "pig", "rabbit/bunny", "sheep"], "Household": ["bathtub", "chair", "cup", "door", "knife", "phone", "potty/toilet", "spoon", "table", "toothbrush"], "Body Parts": ["ear", "eyes", "foot", "hair", "hand", "mouth", "nose", "teeth"], "Clothes": ["boot/s", "coat", "diaper", "hat", "pants", "shirt", "shoe/s", "sock/s"], "Nature": ["flower", "rain", "sun", "tree"], "People": ["baby", "boy", "Daddy", "girl", "Mommy"], "Food": ["apple", "banana", "candy", "cheese", "cookie", "cracker", "French fries", "hamburger", "hotdog", "ice cream cone", "juice", "milk", "pizza", "strawberry", "water"], "Toys/Travel": ["airplane", "ball", "balloon", "bike", "book", "bubbles", "car", "train"], "Action Words/Verbs": ["blow", "clap", "cry", "cut", "drink", "drive", "drop", "eat", "fall down", "hug", "jump", "kick", "kiss", "open", "pour", "push", "run", "sit down", "sleep", "stir", "throw", "turn around", "walk", "wash"], "Adjectives": ["blue", "green", "orange", "purple", "red", "yellow", "one", "two", "three", "big/little", "clean/dirty", "happy/sad", "hot/cold"]}

svg_files = [
    "/home/user/Github/manuscope/frontend/resources/flashcards/ToysTravel/train.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/ToysTravel/plane.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/ToysTravel/car.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/ToysTravel/book.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/ToysTravel/bike.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/ToysTravel/balloon.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/ToysTravel/ball.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/People/dad-mom.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/People/boy-girl.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/People/baby.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Nature/tree.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Nature/sun.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Nature/rain.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Nature/moon.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Nature/flower.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Household/toothbrush.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Household/table.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Household/spoon.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Household/phone.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Household/knife.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Household/hotdog.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Household/fork.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Household/cup.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Household/chair.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Food/water.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Food/strawberry.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Food/pizza.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Food/milk.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Food/juice.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Food/icecream.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Food/hotdog.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Food/hamburger.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Food/frenchfries.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Food/cracker.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Food/cookie.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Food/cheese.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Food/candy.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Food/banana.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Food/apple.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Clothes/socks.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Clothes/shoes.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Clothes/shirt.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Clothes/pants.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Clothes/jacket.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Clothes/hat.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Clothes/diaper.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Clothes/boots.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/BodyParts/teeth.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/BodyParts/nose.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/BodyParts/mouth.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/BodyParts/hand.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/BodyParts/hair.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/BodyParts/feet.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/BodyParts/eyes.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/BodyParts/ears.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Animals/sheep.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Animals/rabbit.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Animals/pig.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Animals/monkey.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Animals/horse.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Animals/fish.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Animals/elephant.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Animals/duck.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Animals/dog.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Animals/cow.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Animals/cat.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Animals/bird.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Animals/bear.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/sad.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/number-9.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/number-8.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/number-7.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/number-6.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/number-5.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/number-4.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/number-3.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/number-2.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/number-1.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/number-0.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/hot.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/happy.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/dirty.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/color-yellow.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/color-red.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/color-purple.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/color-orange.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/color-green.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/color-blue.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/cold.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/clean.svg",
    "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/big-little.svg"
]

sql_statements = []

def normalize_word(word):
    return word.lower().replace(' ', '').replace('/', '').replace('-', '').replace('(', '').replace(')', '')

# Create a mapping from normalized filename to full path
svg_map = {}
for file_path in svg_files:
    filename = os.path.basename(file_path)
    name_without_ext = os.path.splitext(filename)[0]
    svg_map[normalize_word(name_without_ext)] = file_path

# Handle specific mappings
svg_map['airplane'] = "/home/user/Github/manuscope/frontend/resources/flashcards/ToysTravel/plane.svg"
svg_map['daddy'] = "/home/user/Github/manuscope/frontend/resources/flashcards/People/dad-mom.svg"
svg_map['mommy'] = "/home/user/Github/manuscope/frontend/resources/flashcards/People/dad-mom.svg"
svg_map['boy'] = "/home/user/Github/manuscope/frontend/resources/flashcards/People/boy-girl.svg"
svg_map['girl'] = "/home/user/Github/manuscope/frontend/resources/flashcards/People/boy-girl.svg"
svg_map['pottytoilet'] = "/home/user/Github/manuscope/frontend/resources/flashcards/Household/potty.svg" # Assuming potty.svg exists
svg_map['icecreamcone'] = "/home/user/Github/manuscope/frontend/resources/flashcards/Food/icecream.svg"
svg_map['frenchfries'] = "/home/user/Github/manuscope/frontend/resources/flashcards/Food/frenchfries.svg"
svg_map['falldown'] = "/home/user/Github/manuscope/frontend/resources/flashcards/ActionWordsVerbs/falldown.svg" # Assuming falldown.svg exists
svg_map['sitdown'] = "/home/user/Github/manuscope/frontend/resources/flashcards/ActionWordsVerbs/sitdown.svg" # Assuming sitdown.svg exists
svg_map['turnaround'] = "/home/user/Github/manuscope/frontend/resources/flashcards/ActionWordsVerbs/turnaround.svg" # Assuming turnaround.svg exists
svg_map['biglittle'] = "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/big-little.svg"
svg_map['clean'] = "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/clean.svg"
svg_map['dirty'] = "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/dirty.svg"
svg_map['happy'] = "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/happy.svg"
svg_map['sad'] = "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/sad.svg"
svg_map['hot'] = "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/hot.svg"
svg_map['cold'] = "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/cold.svg"
svg_map['one'] = "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/number-1.svg"
svg_map['two'] = "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/number-2.svg"
svg_map['three'] = "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/number-3.svg"
svg_map['blue'] = "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/color-blue.svg"
svg_map['green'] = "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/color-green.svg"
svg_map['orange'] = "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/color-orange.svg"
svg_map['purple'] = "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/color-purple.svg"
svg_map['red'] = "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/color-red.svg"
svg_map['yellow'] = "/home/user/Github/manuscope/frontend/resources/flashcards/Adjectives/color-yellow.svg"
svg_map['boots'] = "/home/user/Github/manuscope/frontend/resources/flashcards/Clothes/boots.svg"
svg_map['shoes'] = "/home/user/Github/manuscope/frontend/resources/flashcards/Clothes/shoes.svg"
svg_map['socks'] = "/home/user/Github/manuscope/frontend/resources/flashcards/Clothes/socks.svg"
svg_map['rabbitbunny'] = "/home/user/Github/manuscope/frontend/resources/flashcards/Animals/rabbit.svg"


for category, words in parsed_data.items():
    for word_text in words:
        normalized_word = normalize_word(word_text)
        image_link = svg_map.get(normalized_word)

        # Handle specific cases where the word in the PDF might not directly map to the SVG filename
        if not image_link:
            if normalized_word == 'boot/s':
                image_link = svg_map.get('boots')
            elif normalized_word == 'shoe/s':
                image_link = svg_map.get('shoes')
            elif normalized_word == 'sock/s':
                image_link = svg_map.get('socks')
            elif normalized_word == 'rabbit/bunny':
                image_link = svg_map.get('rabbit') or svg_map.get('bunny')
            elif normalized_word == 'daddy':
                image_link = svg_map.get('daddy') or svg_map.get('dadmom')
            elif normalized_word == 'mommy':
                image_link = svg_map.get('mommy') or svg_map.get('dadmom')
            elif normalized_word == 'boy':
                image_link = svg_map.get('boy') or svg_map.get('boygirl')
            elif normalized_word == 'girl':
                image_link = svg_map.get('girl') or svg_map.get('boygirl')
            elif normalized_word == 'potty/toilet':
                image_link = svg_map.get('potty') or svg_map.get('toilet')
            elif normalized_word == 'icecreamcone':
                image_link = svg_map.get('icecream')
            elif normalized_word == 'frenchfries':
                image_link = svg_map.get('frenchfries')
            elif normalized_word == 'falldown':
                image_link = svg_map.get('falldown')
            elif normalized_word == 'sitdown':
                image_link = svg_map.get('sitdown')
            elif normalized_word == 'turnaround':
                image_link = svg_map.get('turnaround')
            elif normalized_word == 'big/little':
                image_link = svg_map.get('biglittle')
            elif normalized_word == 'clean/dirty':
                image_link = svg_map.get('clean') or svg_map.get('dirty')
            elif normalized_word == 'happy/sad':
                image_link = svg_map.get('happy') or svg_map.get('sad')
            elif normalized_word == 'hot/cold':
                image_link = svg_map.get('hot') or svg_map.get('cold')
            elif normalized_word == 'one':
                image_link = svg_map.get('number-1')
            elif normalized_word == 'two':
                image_link = svg_map.get('number-2')
            elif normalized_word == 'three':
                image_link = svg_map.get('number-3')
            elif normalized_word == 'blue':
                image_link = svg_map.get('color-blue')
            elif normalized_word == 'green':
                image_link = svg_map.get('color-green')
            elif normalized_word == 'orange':
                image_link = svg_map.get('color-orange')
            elif normalized_word == 'purple':
                image_link = svg_map.get('color-purple')
            elif normalized_word == 'red':
                image_link = svg_map.get('color-red')
            elif normalized_word == 'yellow':
                image_link = svg_map.get('color-yellow')

        if image_link:
            sql_statements.append(f"INSERT INTO words (word, category, image_link) VALUES ('{word_text.replace("'", "''")}', '{category.replace("'", "''")}', '{image_link.replace("'", "''")}')")
        else:
            print(f"-- Warning: No image found for word: {word_text} in category {category}")
            sql_statements.append(f"INSERT INTO words (word, category) VALUES ('{word_text.replace("'", "''")}', '{category.replace("'", "''")}')")

print('\n'.join(sql_statements))