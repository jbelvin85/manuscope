import os
import glob

# This data is based on the Moog Center's vocabulary lists.
# It is manually maintained for now.
parsed_data = {
    "Animals": ["bear", "bird", "cat", "cow", "duck", "elephant", "fish", "horse", "monkey", "pig", "rabbit/bunny", "sheep"],
    "Household": ["bathtub", "chair", "cup", "door", "knife", "phone", "potty/toilet", "spoon", "table", "toothbrush", "fork"],
    "Body Parts": ["ear", "eyes", "foot", "hair", "hand", "mouth", "nose", "teeth", "ears", "feet"],
    "Clothes": ["boot/s", "coat", "diaper", "hat", "pants", "shirt", "shoe/s", "sock/s", "jacket"],
    "Nature": ["flower", "rain", "sun", "tree", "moon"],
    "People": ["baby", "boy", "Daddy", "girl", "Mommy", "dad/mom"],
    "Food": ["apple", "banana", "candy", "cheese", "cookie", "cracker", "French fries", "hamburger", "hotdog", "ice cream cone", "juice", "milk", "pizza", "strawberry", "water"],
    "Toys/Travel": ["airplane", "ball", "balloon", "bike", "book", "bubbles", "car", "train", "plane"],
    "Action Words/Verbs": ["blow", "clap", "cry", "cut", "drink", "drive", "drop", "eat", "fall down", "hug", "jump", "kick", "kiss", "open", "pour", "push", "run", "sit down", "sleep", "stir", "throw", "turn around", "walk", "wash"],
    "Adjectives": ["blue", "green", "orange", "purple", "red", "yellow", "one", "two", "three", "big/little", "clean/dirty", "happy/sad", "hot/cold", "big", "little", "clean", "dirty", "happy", "sad", "hot", "cold"]
}

def normalize_word(word):
    """Normalizes a word for matching by making it lowercase and removing special characters."""
    return word.lower().replace(' ', '').replace('/', '').replace('-', '').replace('(', '').replace(')', '')

def find_image_files(base_dir):
    """Finds all image files (svg, png, jpg) in the given directory."""
    patterns = ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.ai', '**/*.eps']
    files = []
    for pattern in patterns:
        files.extend(glob.glob(os.path.join(base_dir, pattern), recursive=True))
    return files

def create_image_map(image_files, base_dir):
    """Creates a map from a normalized word to its web-accessible image path."""
    image_map = {}
    for file_path in image_files:
        # Get the filename without extension
        filename = os.path.basename(file_path)
        name_without_ext = os.path.splitext(filename)[0]
        
        # Create a web-accessible path
        relative_path = os.path.relpath(file_path, base_dir)
        web_path = '/resources/flashcards/' + relative_path.replace('\\', '/')
        
        # Add the full normalized name
        normalized_full_name = normalize_word(name_without_ext)
        image_map[normalized_full_name] = web_path

        # Handle combined words like 'big-little'
        if '-' in name_without_ext:
            parts = name_without_ext.split('-')
            for part in parts:
                normalized_part = normalize_word(part)
                image_map[normalized_part] = web_path

    return image_map

def generate_sql(data, image_map):
    """Generates SQL INSERT statements for the words."""
    sql_statements = []
    
    # A set to keep track of words that have been inserted to avoid duplicates
    inserted_words = set()

    for category, words in data.items():
        for word_text in words:
            words_to_process = []
            if word_text.endswith('/s'):
                base = word_text.replace('/s', '')
                words_to_process.append(base)
                words_to_process.append(base + 's')
            else:
                words_to_process.extend(word_text.split('/'))

            for sub_word in words_to_process:
                if sub_word in inserted_words:
                    continue

                normalized_sub_word = normalize_word(sub_word)
                image_link = image_map.get(normalized_sub_word)

                # Try to find a match for combined words like 'boy-girl'
                if not image_link:
                    # for combo words like boy-girl, dad-mom, big-little
                    for key, value in image_map.items():
                        if normalized_sub_word in key.split('-'):
                            image_link = value
                            break
                
                # Escape single quotes for SQL
                sql_word = sub_word.replace("'", "''")
                sql_category = category.replace("'", "''")

                if image_link:
                    sql_statements.append(f"INSERT INTO words (word, category, image_link) VALUES ('{sql_word}', '{sql_category}', '{image_link}');")
                else:
                    print(f"-- Warning: No image found for word: {sub_word} in category {category}")
                    sql_statements.append(f"INSERT INTO words (word, category) VALUES ('{sql_word}', '{sql_category}');")
                
                inserted_words.add(sub_word)

    return '\n'.join(sql_statements)

if __name__ == "__main__":
    flashcard_dir = os.path.join('frontend', 'resources', 'flashcards')
    
    # Find all image files
    image_files = find_image_files(flashcard_dir)
    
    # Create the mapping from word to image path
    image_map = create_image_map(image_files, flashcard_dir)
    
    # Generate the SQL
    sql_output = generate_sql(parsed_data, image_map)
    
    # Write the SQL to a file
    with open('insert_words.sql', 'w') as f:
        f.write(sql_output)
        
    print("Successfully generated insert_words.sql")